---
title: "Oh My Zsh 常用 Git 命令"
author: "GeekKery"
date: 2022-04-17T18:33:03+08:00
tags: ["Git"]
---

## 基本概念

- 工作区（workspace）：就是你在电脑里能看到的目录；
- 暂存区（staging area）：存放在 .git/index 文件中，有时也把暂存区叫作索引；
- 版本库（local repository）：工作区有一个隐藏目录 .git，这就是 Git 版本库；
- 远程仓库（remote repository）：本地版本库对应的远程仓库。

## Git 基本信息配置

```bash
# 全局配置；只修改当前项目去掉 --global 参数
git config --global user.name "Jayden Deng"
git config --global user.email "jayden@gmail.com"

# 编辑配置文件
git config -e             # 针对当前仓库 
git config -e --global    # 针对系统上所有仓库

# 查看配置
gcf = 'git config --list' # 查看所有配置
git config user.name      # 查看特定项配置
```

## 状态查询

```bash
gss = 'git status -s'       # 简短模式
gsb = 'git status -sb'      # 简短模式 + 分支

gd = 'git diff'             # 工作区与暂存区差异
gdca = 'git diff --cached'  # 已暂存文件和上次提交时的快照之间的差异

glo = 'git log --oneline --decorate'   # 单行提交信息查看提交记录
glol = "git log --graph --pretty=''"   # 全方位查看提交记录
```

## 工作区 => 版本库

注意，Git2.0 版以前，git add 默认不追踪删除操作。即在工作区删除一个文件后，git add 命令不会将这个变化提交到暂存区，导致这个文件继续存在于历史中。Git2.0 改变了这个行为。

```bash
# 工作区添加到暂存区
gaa = 'git add -A'(--all)     # 所有改动，包括删除

# 暂存区提交到版本库
gcmsg = 'git commit -m'
gcam = 'git commit -a -m'     # 无需 add，前提是已经被 Git 跟踪
gc! = 'git commit -v --amend' # 追加修改到上次提交
gcn! = 'git commit -v --no-edit --amend' # 追加修改到上次提交，不编辑 verbose
```

## 撤销

```bash
grh = 'git reset'         # 暂存区的文件恢复到工作目录中；版本回滚
grhh = 'git reset --hard' # 版本回滚
grmc = 'git rm --cached'  # 从暂存区删除文件
gco = 'git checkout'      # 将文件恢复到上一个版本的状态；切换分支
```

## 分支

```bash
gb = 'git branch'       # 查看本地分支
gba = 'git branch -a'   # 查看所有分支
gcb = 'git checkout -b' # 新建并切换到该分支
gco = 'git checkout'    # 将文件恢复到上一个版本的状态；切换分支
gm = 'git merge'        # 合并分支
gbd = 'git branch -d'   # 删除已被合并分支
gbD = 'git branch -D'   # 删除未被合并分支
```

## 远程操作

```bash
grv = 'git remote -v'                     # 显示远程仓库对应的克隆地址
gcl = 'git clone --recurse-submodules'    # 克隆
gf = 'git fetch'                          # 从远程仓库抓取指定分支的数据
gfo = 'git fetch origin'                  # 从远程仓库抓取所有分支的数据
gl = 'git pull'                           # merge 形式合并
gpr = 'git pull --rebase'                 # rebase 形式合并
```

## 附

Oh My Zsh 的 [Git 插件配置](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/git/git.plugin.zsh)：
 
``` bash
alias g='git'

alias ga='git add'
alias gaa='git add --all'
alias gapa='git add --patch'
alias gau='git add --update'
alias gav='git add --verbose'
alias gap='git apply'
alias gapt='git apply --3way'

alias gb='git branch'
alias gba='git branch -a'
alias gbd='git branch -d'
alias gbda='git branch --no-color --merged | command grep -vE "^([+*]|\s*($(git_main_branch)|$(git_develop_branch))\s*$)" | command xargs git branch -d 2>/dev/null'
alias gbD='git branch -D'
alias gbl='git blame -b -w'
alias gbnm='git branch --no-merged'
alias gbr='git branch --remote'
alias gbs='git bisect'
alias gbsb='git bisect bad'
alias gbsg='git bisect good'
alias gbsr='git bisect reset'
alias gbss='git bisect start'

alias gc='git commit -v'
alias gc!='git commit -v --amend'
alias gcn!='git commit -v --no-edit --amend'
alias gca='git commit -v -a'
alias gca!='git commit -v -a --amend'
alias gcan!='git commit -v -a --no-edit --amend'
alias gcans!='git commit -v -a -s --no-edit --amend'
alias gcam='git commit -a -m'
alias gcsm='git commit -s -m'
alias gcas='git commit -a -s'
alias gcasm='git commit -a -s -m'
alias gcb='git checkout -b'
alias gcf='git config --list'

alias gcl='git clone --recurse-submodules'
alias gclean='git clean -id'
alias gpristine='git reset --hard && git clean -dffx'
alias gcm='git checkout $(git_main_branch)'
alias gcd='git checkout $(git_develop_branch)'
alias gcmsg='git commit -m'
alias gco='git checkout'
alias gcor='git checkout --recurse-submodules'
alias gcount='git shortlog -sn'
alias gcp='git cherry-pick'
alias gcpa='git cherry-pick --abort'
alias gcpc='git cherry-pick --continue'
alias gcs='git commit -S'
alias gcss='git commit -S -s'
alias gcssm='git commit -S -s -m'

alias gd='git diff'
alias gdca='git diff --cached'
alias gdcw='git diff --cached --word-diff'
alias gdct='git describe --tags $(git rev-list --tags --max-count=1)'
alias gds='git diff --staged'
alias gdt='git diff-tree --no-commit-id --name-only -r'
alias gdup='git diff @{upstream}'
alias gdw='git diff --word-diff'

alias ggpur='ggu'
alias ggpull='git pull origin "$(git_current_branch)"'
alias ggpush='git push origin "$(git_current_branch)"'

alias ggsup='git branch --set-upstream-to=origin/$(git_current_branch)'
alias gpsup='git push --set-upstream origin $(git_current_branch)'

alias ghh='git help'

alias gignore='git update-index --assume-unchanged'
alias gignored='git ls-files -v | grep "^[[:lower:]]"'
alias git-svn-dcommit-push='git svn dcommit && git push github $(git_main_branch):svntrunk'

alias gk='\gitk --all --branches &!'
alias gke='\gitk --all $(git log -g --pretty=%h) &!'

alias gl='git pull'
alias glg='git log --stat'
alias glgp='git log --stat -p'
alias glgg='git log --graph'
alias glgga='git log --graph --decorate --all'
alias glgm='git log --graph --max-count=10'
alias glo='git log --oneline --decorate'
alias glol="git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ar) %C(bold blue)<%an>%Creset'"
alias glols="git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ar) %C(bold blue)<%an>%Creset' --stat"
alias glod="git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ad) %C(bold blue)<%an>%Creset'"
alias glods="git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ad) %C(bold blue)<%an>%Creset' --date=short"
alias glola="git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ar) %C(bold blue)<%an>%Creset' --all"
alias glog='git log --oneline --decorate --graph'
alias gloga='git log --oneline --decorate --graph --all'
alias glp="_git_log_prettily"

alias gm='git merge'
alias gmom='git merge origin/$(git_main_branch)'
alias gmtl='git mergetool --no-prompt'
alias gmtlvim='git mergetool --no-prompt --tool=vimdiff'
alias gmum='git merge upstream/$(git_main_branch)'
alias gma='git merge --abort'

alias gp='git push'
alias gpd='git push --dry-run'
alias gpf='git push --force-with-lease'
alias gpf!='git push --force'
alias gpoat='git push origin --all && git push origin --tags'
alias gpr='git pull --rebase'
alias gpu='git push upstream'
alias gpv='git push -v'

alias gr='git remote'
alias gra='git remote add'
alias grb='git rebase'
alias grba='git rebase --abort'
alias grbc='git rebase --continue'
alias grbd='git rebase $(git_develop_branch)'
alias grbi='git rebase -i'
alias grbm='git rebase $(git_main_branch)'
alias grbom='git rebase origin/$(git_main_branch)'
alias grbo='git rebase --onto'
alias grbs='git rebase --skip'
alias grev='git revert'
alias grh='git reset'
alias grhh='git reset --hard'
alias groh='git reset origin/$(git_current_branch) --hard'
alias grm='git rm'
alias grmc='git rm --cached'
alias grmv='git remote rename'
alias grrm='git remote remove'
alias grs='git restore'
alias grset='git remote set-url'
alias grss='git restore --source'
alias grst='git restore --staged'
alias grt='cd "$(git rev-parse --show-toplevel || echo .)"'
alias gru='git reset --'
alias grup='git remote update'
alias grv='git remote -v'

alias gsb='git status -sb'
alias gsd='git svn dcommit'
alias gsh='git show'
alias gsi='git submodule init'
alias gsps='git show --pretty=short --show-signature'
alias gsr='git svn rebase'
alias gss='git status -s'
alias gst='git status'


alias gstaa='git stash apply'
alias gstc='git stash clear'
alias gstd='git stash drop'
alias gstl='git stash list'
alias gstp='git stash pop'
alias gsts='git stash show --text'
alias gstu='gsta --include-untracked'
alias gstall='git stash --all'
alias gsu='git submodule update'
alias gsw='git switch'
alias gswc='git switch -c'
alias gswm='git switch $(git_main_branch)'
alias gswd='git switch $(git_develop_branch)'

alias gts='git tag -s'
alias gtv='git tag | sort -V'
alias gtl='gtl(){ git tag --sort=-v:refname -n -l "${1}*" }; noglob gtl'

alias gunignore='git update-index --no-assume-unchanged'
alias gunwip='git log -n 1 | grep -q -c "\-\-wip\-\-" && git reset HEAD~1'
alias gup='git pull --rebase'
alias gupv='git pull --rebase -v'
alias gupa='git pull --rebase --autostash'
alias gupav='git pull --rebase --autostash -v'
alias glum='git pull upstream $(git_main_branch)'

alias gwch='git whatchanged -p --abbrev-commit --pretty=medium'
alias gwip='git add -A; git rm $(git ls-files --deleted) 2> /dev/null; git commit --no-verify --no-gpg-sign -m "--wip-- [skip ci]"'

alias gam='git am'
alias gamc='git am --continue'
alias gams='git am --skip'
alias gama='git am --abort'
```