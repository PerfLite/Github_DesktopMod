# GitHub Manager

Десктопное приложение для управления GitHub репозиториями — аналог GitHub Desktop для Linux.

Написано на Python + PyWebView (GTK WebKit2). UI на HTML/CSS/JS

## Возможности

- Авторизация через GitHub Personal Access Token (сохраняется автоматически)
- Список репозиториев с языком, звёздами и датой обновления
- Создание репозитория с выбором .gitignore шаблона, лицензии и ветки
- Клонирование репозиториев
- Удаление репозиториев
- Просмотр изменений (Changes) с подсветкой diff
- Коммит + автоматический push
- История коммитов с просмотром diff каждого коммита
- Переключение веток
- Fetch / Push
- Автоматическое обнаружение изменений в файлах (file watcher)
- Автогенерация сообщения коммита
- Открытие репозитория на GitHub и в файловом менеджере
- Аватарка пользователя

## Установка

### 1. Системные зависимости (Linux)

```bash
# Ubuntu/Debian
sudo apt install python3-gi python3-gi-cairo gir1.2-webkit2-4.1

# Arch
sudo pacman -S python-gobject webkit2gtk
```

### 2. Виртуальное окружение

```bash
python3 -m venv venv --system-site-packages
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Запуск

```bash
venv/bin/python app.py
```

### 4. Сборка standalone бинарника (опционально)

Для запуска без виртуального окружения можно собрать исполняемый файл через PyInstaller:

```bash
# Установить PyInstaller
source venv/bin/activate
pip install pyinstaller

# Собрать бинарник
pyinstaller --onefile --windowed --add-data "ui:ui" app.py

# Готовый файл: dist/app
./dist/app
```

### 5. Установка в систему (опционально)

```bash
# Скопировать бинарник и иконку
mkdir -p ~/.local/bin
cp dist/app ~/.local/bin/github-manager
cp ui/github-64.png ~/.local/bin/github-icon.png

# Создать desktop entry
cat > ~/.local/share/applications/github-manager.desktop << EOF
[Desktop Entry]
Name=GitHub Manager
Comment=Manage GitHub repositories
Exec=$HOME/.local/bin/github-manager
Icon=$HOME/.local/bin/github-icon.png
Terminal=false
Type=Application
Categories=Development;Network;
StartupWMClass=GitHub
EOF
```

После этого приложение появится в меню приложений.

## Получение GitHub Personal Access Token

1. Перейдите на https://github.com/settings/tokens/new
2. Выберите scopes:
   - `repo` — полный доступ к репозиториям
   - `read:user` — чтение информации о пользователе
   - `delete_repo` — удаление репозиториев (опционально)
3. Нажмите "Generate token" и вставьте в приложение

## Структура проекта

```
├── app.py              # PyWebView backend + Python API
├── github_client.py    # GitHub REST API клиент
├── requirements.txt    # Зависимости
├── ui/
│   ├── index.html      # Точка входа
│   ├── style.css       # Стили (тёмная тема GitHub)
│   └── app.js          # Frontend логика
└── README.md
```

## Зависимости

- **PyWebView** — десктопное окно на GTK WebKit2
- **Requests** — HTTP клиент для GitHub API
- **GitPython** — работа с локальными git репозиториями

## Требования

- Python 3.10+
- Linux с GTK 3 и WebKit2GTK
- Git установлен в системе
