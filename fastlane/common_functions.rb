# @Author: Xiao Feng Wang  <xf>
# @Date:   2017-08-17T14:54:31+08:00
# @Email:  wangxiaofeng@hualala.com
# @Filename: common_functions.rb
# @Last modified by:   xf
# @Last modified time: 2017-08-17T14:54:55+08:00
# @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.

require 'net/http/post/multipart'

############
# Fuctions #
############

def print_ruby_enviroment()
  ENV.each do |key, value|
    puts "ENV[#{key}]=#{value}"
  end
end

def file_path(filename)
  if !filename
    raise "Please specify filename"
  elsif File.exist? filename
    return filename
  elsif File.exist? (absolute_ipa_path = "#{ENV["PWD"]}/#{filename}")
    return absolute_ipa_path
  else
    raise "Did not find the file path'#{filename}'."
  end
end

def exec_script(script)
  return (script).gsub(/\n/,'')
end

# 取得 .plist 中的某个 key 值
def fetch_info_plist(plist, key)
  return exec_script(`/usr/libexec/PlistBuddy -c "Print #{key}" "#{file_path(plist)}"`)
end

# 取得目前分支名称
def git_branch_name()
  return exec_script(`git rev-parse --abbrev-ref HEAD`)
end

# 取得目前 commit
def git_commit_short()
  return exec_script(`git rev-parse --short HEAD`)
end

# 取得 commit 的作者信箱
def git_author_email()
  return exec_script(`git log -1 --pretty=%aE`)
end

# 取得 commit 的作者信箱
def git_author_name()
  return exec_script(`git log -1 --pretty=%aN`)
end

# 取得目前提交历史数量，当做 build number 使用，參考：
# http://stackoverflow.com/questions/9258344/better-way-of-incrementing-build-number
# https://objcsharp.wordpress.com/2013/10/01/how-to-automatically-update-xcode-build-numbers-from-git/
def git_commit_number()
  return exec_script(`git rev-list HEAD | wc -l | tr -d ' '`)
end

# 撷取 xctool build 失败时的讯息
def exception_message(text)
  test_failed_message = text.match(/(TEST.*ms\))/)
  if test_failed_message
    return test_failed_message.to_s
  else
    return text
  end
end
