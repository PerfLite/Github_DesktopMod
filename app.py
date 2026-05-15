import webview
import json
import os
import sys
import subprocess
import threading
import git
from github_client import GitHubClient


def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.dirname(__file__)
    return os.path.join(base_path, relative_path)

CONFIG_PATH = os.path.expanduser("~/.config/github-manager/config.json")


def load_config():
    try:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH) as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def save_config(data: dict):
    try:
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        with open(CONFIG_PATH, "w") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


class Api:
    def __init__(self):
        self.client = GitHubClient()
        self.current_user = None
        self._local_repo = None
        self._local_path = None
        self._watcher_active = False
        self._watcher_thread = None
        self._window = None  # set after window creation

    def _js(self, code: str):
        """Safe JS evaluation."""
        if self._window:
            self._window.evaluate_js(code)

    # ── AUTH ──────────────────────────────────────────────────────────────────
    def get_saved_token(self):
        return load_config().get("token")

    def login(self, token: str):
        self.client.set_token(token)
        ok, result = self.client.authenticate()
        if ok:
            self.current_user = result
            # Получаем avatar_url
            try:
                import requests
                r = requests.get("https://api.github.com/user",
                                 headers={"Authorization": f"token {token}",
                                          "Accept": "application/vnd.github.v3+json"}, timeout=5)
                user_data = r.json() if r.status_code == 200 else {}
            except Exception:
                user_data = {}
            cfg = load_config()
            cfg["token"] = token
            cfg["avatar_url"] = user_data.get("avatar_url", "")
            save_config(cfg)
            return {"ok": True, "user": result, "avatar_url": user_data.get("avatar_url", "")}
        return {"ok": False, "error": result}

    def logout(self):
        self.current_user = None
        self._local_repo = None
        self._local_path = None
        cfg = load_config()
        cfg.pop("token", None)
        save_config(cfg)
        return {"ok": True}

    def get_current_user(self):
        return self.current_user

    # ── REPOS ─────────────────────────────────────────────────────────────────
    def get_repos(self):
        ok, result = self.client.get_user_repos()
        if ok:
            cfg = load_config()
            cfg["repos_cache"] = [
                {k: r.get(k) for k in ["name", "description", "language",
                                        "private", "html_url", "clone_url",
                                        "stargazers_count", "default_branch",
                                        "updated_at"]}
                for r in result
            ]
            save_config(cfg)
            return {"ok": True, "repos": result}
        return {"ok": False, "error": result}

    def get_cached_repos(self):
        return load_config().get("repos_cache", [])

    def create_repo(self, name: str, description: str, private: bool,
                    auto_init: bool, gitignore: str, branch: str, local_path: str):
        print(f"[create_repo] name={name} path={local_path} branch={branch}")
        ok, result = self.client.create_repo(
            name=name, description=description,
            private=private, auto_init=False
        )
        print(f"[create_repo] github ok={ok} result={result if not ok else 'OK'}")
        if not ok:
            return {"ok": False, "error": result}

        clone_url = result.get("clone_url", "")
        repo_path = local_path if os.path.basename(local_path.rstrip("/")) == name \
                    else os.path.join(local_path, name)
        print(f"[create_repo] repo_path={repo_path}")

        def do():
            try:
                os.makedirs(repo_path, exist_ok=True)
                if os.path.exists(os.path.join(repo_path, ".git")):
                    local_repo = git.Repo(repo_path)
                    print("[git] opened existing")
                else:
                    local_repo = git.Repo.init(repo_path, initial_branch=branch or "main")
                    print(f"[git] initialized branch={branch}")

                if gitignore and gitignore != "None":
                    try:
                        import requests
                        r = requests.get(
                            f"https://api.github.com/gitignore/templates/{gitignore}",
                            headers={"Accept": "application/vnd.github.v3+json"}, timeout=5
                        )
                        if r.status_code == 200:
                            with open(os.path.join(repo_path, ".gitignore"), "w") as f:
                                f.write(r.json().get("source", ""))
                    except Exception:
                        pass

                if auto_init and not os.path.exists(os.path.join(repo_path, "README.md")):
                    with open(os.path.join(repo_path, "README.md"), "w") as f:
                        f.write(f"# {name}\n\n{description}\n" if description else f"# {name}\n")

                local_repo.git.add("-A")
                status = local_repo.git.status(porcelain=True)
                print(f"[git] status='{status.strip()[:80]}' head={local_repo.head.is_valid()}")
                if status.strip():
                    local_repo.index.commit("Initial commit")
                    print("[git] committed")
                elif not local_repo.head.is_valid():
                    with open(os.path.join(repo_path, "README.md"), "w") as f:
                        f.write(f"# {name}\n")
                    local_repo.git.add("-A")
                    local_repo.index.commit("Initial commit")
                    print("[git] forced README commit")

                token = load_config().get("token", "")
                push_url = clone_url.replace("https://", f"https://{token}@") if token else clone_url
                try:
                    local_repo.delete_remote("origin")
                except Exception:
                    pass
                local_repo.create_remote("origin", push_url)
                if local_repo.head.is_valid():
                    print(f"[git] pushing {local_repo.active_branch.name}")
                    local_repo.git.push("--set-upstream", "origin", local_repo.active_branch.name)
                    print("[git] pushed OK")
                local_repo.remotes.origin.set_url(clone_url)

                cfg = load_config()
                if "repo_paths" not in cfg:
                    cfg["repo_paths"] = {}
                cfg["repo_paths"][name] = repo_path
                cfg["last_create_path"] = os.path.dirname(repo_path.rstrip("/"))
                save_config(cfg)

                print(f"[create_repo] calling onCreateRepoSuccess")
                self._js(f'onCreateRepoSuccess({json.dumps(name)})')
            except Exception as ex:
                import traceback; traceback.print_exc()
                self._js(f'onCreateRepoError({json.dumps(str(ex))})')
        threading.Thread(target=do, daemon=True).start()
        return {"ok": True, "started": True}

    def delete_repo(self, owner: str, repo: str):
        ok, msg = self.client.delete_repo(owner, repo)
        return {"ok": ok, "error": msg if not ok else None}

    def get_gitignore_templates(self):
        try:
            import requests
            r = requests.get(
                "https://api.github.com/gitignore/templates",
                headers={"Accept": "application/vnd.github.v3+json"}, timeout=5
            )
            if r.status_code == 200:
                return ["None"] + r.json()
        except Exception:
            pass
        return ["None"]

    # ── LOCAL REPO ────────────────────────────────────────────────────────────
    def get_saved_repo_path(self, repo_name: str):
        return load_config().get("repo_paths", {}).get(repo_name)

    def open_local_repo(self, path: str):
        if not os.path.exists(os.path.join(path, ".git")):
            return {"ok": False, "error": "Not a git repository"}
        try:
            self._local_repo = git.Repo(path)
            self._local_path = path
            cfg = load_config()
            # save path by repo name (dirname)
            return {"ok": True, "path": path}
        except Exception as ex:
            return {"ok": False, "error": str(ex)}

    def clone_repo(self, url: str, dest: str):
        def do():
            try:
                parent = os.path.dirname(dest.rstrip("/"))
                os.makedirs(parent, exist_ok=True)
                subprocess.run(["git", "clone", url, dest], check=True,
                               capture_output=True, text=True)
                cfg = load_config()
                cfg["last_clone_path"] = parent
                save_config(cfg)
                self._js(f'onCloneSuccess({json.dumps(dest)})')
            except subprocess.CalledProcessError as ex:
                self._js(f'onCloneError({json.dumps(ex.stderr)})')
            except Exception as ex:
                self._js(f'onCloneError({json.dumps(str(ex))})')
        threading.Thread(target=do, daemon=True).start()
        return {"ok": True, "started": True}

    def get_last_clone_path(self):
        return load_config().get("last_clone_path", os.path.expanduser("~/projects"))

    def get_changes(self):
        if not self._local_repo:
            return {"ok": False, "error": "No local repo"}
        try:
            status = self._local_repo.git.status(porcelain=True)
            lines = [l for l in status.split("\n") if l.strip()]
            changes = []
            seen_dirs = set()
            for line in lines:
                code = line[:2].strip()
                fpath = line[3:]
                parts = fpath.split("/")
                is_dir = len(parts) > 1
                display = parts[0] + "/" if is_dir else fpath
                if is_dir and display in seen_dirs:
                    continue
                if is_dir:
                    seen_dirs.add(display)
                changes.append({"code": code, "path": fpath, "display": display, "is_dir": is_dir})
            return {"ok": True, "changes": changes}
        except Exception as ex:
            return {"ok": False, "error": str(ex)}

    def get_diff(self, filepath: str):
        if not self._local_repo:
            return {"ok": False, "diff": ""}
        try:
            diff = self._local_repo.git.diff(filepath)
            if not diff:
                diff = self._local_repo.git.diff("--cached", filepath)
            return {"ok": True, "diff": diff or "(new file)"}
        except Exception as ex:
            return {"ok": False, "diff": str(ex)}

    def commit(self, message: str, description: str):
        if not self._local_repo:
            return {"ok": False, "error": "No local repo"}
        try:
            status = self._local_repo.git.status(porcelain=True)
            if not status.strip():
                return {"ok": False, "error": "Nothing to commit"}
            self._local_repo.git.add("-A")
            full_msg = f"{message}\n\n{description}" if description else message
            self._local_repo.index.commit(full_msg)

            def do_push():
                try:
                    origin = self._local_repo.remote("origin")
                    token = load_config().get("token", "")
                    push_url = origin.url.replace("https://", f"https://{token}@") if token else origin.url
                    subprocess.run(
                        ["git", "-C", self._local_path, "push", push_url,
                         self._local_repo.active_branch.name],
                        capture_output=True, text=True
                    )
                    self._js('onPushSuccess()')
                except Exception as ex:
                    self._js(f'onPushError({json.dumps(str(ex))})')
            threading.Thread(target=do_push, daemon=True).start()
            return {"ok": True}
        except Exception as ex:
            return {"ok": False, "error": str(ex)}

    def push(self):
        if not self._local_repo:
            return {"ok": False, "error": "No local repo"}
        def do():
            try:
                origin = self._local_repo.remote("origin")
                token = load_config().get("token", "")
                push_url = origin.url.replace("https://", f"https://{token}@") if token else origin.url
                subprocess.run(
                    ["git", "-C", self._local_path, "push", push_url,
                     self._local_repo.active_branch.name],
                    capture_output=True, text=True, check=True
                )
                self._js('onPushSuccess()')
            except Exception as ex:
                self._js(f'onPushError({json.dumps(str(ex))})')
        threading.Thread(target=do, daemon=True).start()
        return {"ok": True, "started": True}

    def fetch(self):
        if not self._local_repo:
            return {"ok": False, "error": "No local repo"}
        def do():
            try:
                subprocess.run(
                    ["git", "-C", self._local_path, "fetch"],
                    capture_output=True, text=True
                )
                self._js('onFetchSuccess()')
            except Exception as ex:
                self._js(f'onFetchError({json.dumps(str(ex))})')
        threading.Thread(target=do, daemon=True).start()
        return {"ok": True, "started": True}

    def get_branch_info(self):
        if not self._local_repo:
            return {"branch": "", "ahead": 0, "behind": 0}
        try:
            branch = self._local_repo.active_branch.name
            try:
                ahead = int(self._local_repo.git.rev_list("--count", "HEAD@{u}..HEAD"))
                behind = int(self._local_repo.git.rev_list("--count", "HEAD..HEAD@{u}"))
            except Exception:
                ahead = behind = 0
            return {"branch": branch, "ahead": ahead, "behind": behind}
        except Exception:
            return {"branch": "unknown", "ahead": 0, "behind": 0}

    def get_branches(self):
        if not self._local_repo:
            return []
        try:
            return [b.name for b in self._local_repo.branches]
        except Exception:
            return []

    def checkout_branch(self, branch: str):
        if not self._local_repo:
            return {"ok": False, "error": "No local repo"}
        try:
            self._local_repo.git.checkout(branch)
            return {"ok": True}
        except Exception as ex:
            return {"ok": False, "error": str(ex)}

    def get_commit_diff(self, sha: str):
        if not self._local_repo:
            return {"ok": False, "diff": ""}
        try:
            commit = self._local_repo.commit(sha)
            if commit.parents:
                diff = self._local_repo.git.diff(
                    commit.parents[0].hexsha, commit.hexsha,
                    '--stat', '--no-color'
                )
                diff += '\n\n'
                diff += self._local_repo.git.diff(
                    commit.parents[0].hexsha, commit.hexsha,
                    '--no-color', '--unified=3'
                )
            else:
                diff = self._local_repo.git.show(
                    sha, '--no-color', '--unified=3', format='%B'
                )
            return {"ok": True, "diff": diff[:50000]}  # limit size
        except Exception as ex:
            return {"ok": False, "diff": str(ex)}

    def get_history(self):
        if not self._local_repo:
            return []
        try:
            commits = list(self._local_repo.iter_commits(max_count=50))
            return [{"sha": c.hexsha[:7], "message": c.message.split("\n")[0][:60],
                     "author": c.author.name, "date": c.committed_datetime.strftime("%Y-%m-%d %H:%M")}
                    for c in commits]
        except Exception:
            return []

    def open_in_browser(self, url: str):
        subprocess.Popen(["xdg-open", url])
        return {"ok": True}

    def open_in_files(self, path: str):
        if path and os.path.exists(path):
            subprocess.Popen(["xdg-open", path])
            return {"ok": True}
        return {"ok": False, "error": "Path not found"}

    def get_local_path(self):
        return self._local_path

    def get_config(self):
        return load_config()

    def save_config_key(self, key: str, value):
        cfg = load_config()
        cfg[key] = value
        save_config(cfg)
        return {"ok": True}

    # ── FILE WATCHER ──────────────────────────────────────────────────────────
    def start_watcher(self):
        self._watcher_active = True
        last = {"status": None}

        def poll():
            while self._watcher_active:
                try:
                    if self._local_path and os.path.exists(self._local_path):
                        result = subprocess.run(
                            ["git", "-C", self._local_path, "status", "--porcelain"],
                            capture_output=True, text=True, timeout=3
                        )
                        new = result.stdout
                        if last["status"] is not None and new != last["status"]:
                            last["status"] = new
                            self._js('onFileChanged()')
                        elif last["status"] is None:
                            last["status"] = new
                except Exception:
                    pass
                import time
                time.sleep(2)

        self._watcher_thread = threading.Thread(target=poll, daemon=True)
        self._watcher_thread.start()
        return {"ok": True}

    def stop_watcher(self):
        self._watcher_active = False
        return {"ok": True}


api = Api()
window = None


def main():
    global window
    window = webview.create_window(
        title="GitHub",
        url=resource_path("ui/index.html"),
        js_api=api,
        width=1280,
        height=800,
        min_size=(900, 600),
        background_color="#1e2228",
    )
    api._window = window
    webview.start(debug=False, gui='gtk')


if __name__ == "__main__":
    main()
