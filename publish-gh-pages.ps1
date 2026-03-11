param(
  [Parameter(Mandatory=$true)]
  [string]$RepoName,
  [string]$Visibility = "public"
)

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
  throw "GitHub CLI not found at $gh"
}

$auth = & $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "Please run: gh auth login"
}

if (-not (Test-Path .git)) {
  git init
}

$currentBranch = (git branch --show-current)
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
  git checkout -b main
} elseif ($currentBranch -ne "main") {
  git branch -M main
}

$name = git config user.name
$email = git config user.email
if ([string]::IsNullOrWhiteSpace($name)) {
  $login = & $gh api user --jq .login
  if (-not [string]::IsNullOrWhiteSpace($login)) {
    git config user.name $login
    git config user.email "$login@users.noreply.github.com"
  }
}

git add .
$hasChanges = git diff --cached --name-only
if (-not [string]::IsNullOrWhiteSpace($hasChanges)) {
  git commit -m "init warm cat site"
}

$repoExists = & $gh repo view $RepoName 2>$null
if ($LASTEXITCODE -ne 0) {
  & $gh repo create $RepoName --$Visibility --source . --remote origin --push
} else {
  if (-not (git remote | Select-String -SimpleMatch "origin")) {
    $user = & $gh api user --jq .login
    git remote add origin "https://github.com/$user/$RepoName.git"
  }
  git push -u origin main
}

$userName = & $gh api user --jq .login
& $gh api -X POST "repos/$userName/$RepoName/pages" -f source[branch]=main -f source[path]="/" 2>$null | Out-Null

Start-Sleep -Seconds 2
Write-Output "Repository: https://github.com/$userName/$RepoName"
Write-Output "Pages URL: https://$userName.github.io/$RepoName/"
