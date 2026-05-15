import requests
from typing import Optional


class GitHubClient:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3+json"
            })
        self.base_url = "https://api.github.com"

    def set_token(self, token: str):
        self.token = token
        self.session.headers.update({
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        })

    def authenticate(self) -> tuple[bool, str]:
        try:
            response = self.session.get(f"{self.base_url}/user")
            if response.status_code == 200:
                user = response.json()
                return True, user["login"]
            elif response.status_code == 401:
                return False, "Invalid token"
            else:
                return False, f"Error: {response.status_code}"
        except Exception as e:
            return False, str(e)

    def get_user_repos(self, page: int = 1, per_page: int = 30) -> tuple[bool, list | str]:
        try:
            response = self.session.get(
                f"{self.base_url}/user/repos",
                params={"page": page, "per_page": per_page, "sort": "updated"}
            )
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, f"Error: {response.status_code}"
        except Exception as e:
            return False, str(e)

    def create_repo(
        self,
        name: str,
        description: str = "",
        private: bool = False,
        auto_init: bool = False
    ) -> tuple[bool, dict | str]:
        try:
            data = {
                "name": name,
                "description": description,
                "private": private,
                "auto_init": auto_init
            }
            response = self.session.post(f"{self.base_url}/user/repos", json=data)
            if response.status_code == 201:
                return True, response.json()
            else:
                return False, response.json().get("message", f"Error: {response.status_code}")
        except Exception as e:
            return False, str(e)

    def get_repo(self, owner: str, repo: str) -> tuple[bool, dict | str]:
        try:
            response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}")
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, f"Error: {response.status_code}"
        except Exception as e:
            return False, str(e)

    def create_issue(
        self,
        owner: str,
        repo: str,
        title: str,
        body: str = ""
    ) -> tuple[bool, dict | str]:
        try:
            data = {"title": title, "body": body}
            response = self.session.post(
                f"{self.base_url}/repos/{owner}/{repo}/issues",
                json=data
            )
            if response.status_code == 201:
                return True, response.json()
            else:
                return False, response.json().get("message", f"Error: {response.status_code}")
        except Exception as e:
            return False, str(e)

    def delete_repo(self, owner: str, repo: str) -> tuple[bool, str]:
        try:
            response = self.session.delete(f"{self.base_url}/repos/{owner}/{repo}")
            if response.status_code == 204:
                return True, "Deleted"
            else:
                msg = response.json().get("message", f"Error: {response.status_code}")
                return False, msg
        except Exception as e:
            return False, str(e)
