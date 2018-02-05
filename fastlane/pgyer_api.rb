# @Author: Xiao Feng Wang  <xf>
# @Date:   2017-08-11T15:53:39+08:00
# @Email:  wangxiaofeng@hualala.com
# @Filename: pgyer_api.rb
# @Last modified by:   xf
# @Last modified time: 2017-08-17T15:07:40+08:00
# @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.

require './ipa_analyzer.rb'

def upload_to_pgyer(opts = {})
  # API reference
  # @see https://www.pgyer.com/doc/api#paramInfo

  ## @optional
  ipa_name = opts[:ipa] || ENV["IPA_OUTPUT_PATH"]
  upload_url = opts[:upload_url] || "https://qiniu-storage.pgyer.com/apiv1/app/upload"
  api_key = opts[:api_key] || ENV["PGYER_API_KEY"]
  user_key = opts[:user_key] || ENV["PGYER_USER_KEY"]
  app_id = opts[:app_id] || ENV["PGYER_APP_ID"]
  changelog = opts[:changelog] || ""

  ## prepare
  ipa_path = file_path(ipa_name)
  file = UploadIO.new(ipa_path, 'application/octet-stream')

  multipart_data = {
    "_api_key" => api_key,
    "uKey" => user_key,
    "file" => file,
    "password" => "hmall",
    "updateDescription" => changelog,
  }

  puts "#{description_for_ipa(ipa_name)}"
  puts "Start to upload .ipa to PGYER (#{upload_url}). It may takes a few minutes. Please be cautious."

  uri = URI(upload_url)
  response = Net::HTTP.start(uri.host, uri.port) do |http|
    request = Net::HTTP::Post::Multipart.new(uri, multipart_data)
    request.use_ssl = true
    http.request request
  end

  puts ".ipa uploading finish."

  response_json = JSON.parse(response.body)
  appShortCutUrl = response_json["data"]["appShortcutUrl"]
  appQRCodeURL   = response_json["data"]["appQRCodeURL"]

  return {
    url: "https://www.pgyer.com/#{appShortcutUrl}",
    QRCode: appQRCodeURL
  }
end
