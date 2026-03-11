# 暖暖猫咪幸运站

这是一个可直接托管到 GitHub Pages 的静态网站，功能包含：

1. 第一层：用户输入名字、年龄、城市、爱好、愿望，并保存到浏览器本地。
2. 第二层：抽取当日幸运签（可重新抽签）。
3. 第三层：根据名字生成小诗 + 小猫咪换装小游戏（多装饰） + 合成纪念图下载。

## 本地预览

1. 直接双击打开 `index.html`。
2. 或运行：
   - `.\serve.ps1`
   - 浏览器访问 `http://localhost:5500/`

## 发布到 GitHub 并公网访问

### 方式 A（推荐，一键）

1. 安装并登录 GitHub CLI：
   - `gh auth login`
2. 在仓库目录执行：
   - `.\publish-gh-pages.ps1 -RepoName your-repo-name -Visibility public`
3. 成功后会输出：
   - 仓库地址：`https://github.com/<用户名>/<仓库名>`
   - 公网地址：`https://<用户名>.github.io/<仓库名>/`

### 方式 B（手动）

1. 提交并推送代码到 GitHub 公有仓库：
   - `git add .`
   - `git commit -m "init warm cat site"`
   - `gh repo create <repo-name> --public --source . --remote origin --push`
2. 在 GitHub 仓库 Settings -> Pages：
   - Build and deployment 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选择 `/ (root)`
3. 保存后等待 1-3 分钟，获得公网访问地址。
