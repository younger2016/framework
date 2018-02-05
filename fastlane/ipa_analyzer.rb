# @Author: Xiao Feng Wang  <xf>
# @Date:   2017-08-11T15:54:25+08:00
# @Email:  wangxiaofeng@hualala.com
# @Filename: ipa_analyzer.rb
# @Last modified by:   xf
# @Last modified time: 2017-08-11T15:55:51+08:00
# @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.

# From bitrise-io/ipa_analyzer @Github
# https://github.com/bitrise-io/ipa_analyzer/blob/master/lib/ipa_analyzer/analyzer.rb
# Release under MIT

require 'tempfile'
require 'zip'
require 'zip/filesystem'
require 'plist'

module IpaAnalyzer
  class Analyzer
    def initialize(ipa_path)
      @ipa_path = ipa_path
      @ipa_zipfile = nil
      @app_folder_path = nil
    end

    def open!
      @ipa_zipfile = Zip::File.open(@ipa_path)
      @app_folder_path = find_app_folder_in_ipa()
      raise "No app folder found in the IPA" if @app_folder_path.nil?
    end

    def open?
      return !@ipa_zipfile.nil?
    end

    def close
      if self.open?
        @ipa_zipfile.close()
      end
    end

    def collect_provision_info
      raise "IPA is not open" unless self.open?

      result = {
        path_in_ipa: nil,
        content: {}
      }
      mobileprovision_path = "#{@app_folder_path}/embedded.mobileprovision"
      mobileprovision_entry = @ipa_zipfile.find_entry(mobileprovision_path)

      raise "Embedded mobile provisioning file not found in (#{@ipa_path}) at path (#{mobileprovision_path})" unless mobileprovision_entry
      result[:path_in_ipa] = "#{mobileprovision_entry}"

      tempfile = Tempfile.new(::File.basename(mobileprovision_entry.name))
      begin
        @ipa_zipfile.extract(mobileprovision_entry, tempfile.path){ override = true }
        plist = Plist::parse_xml(`security cms -D -i #{tempfile.path}`)

        plist.each do |key, value|
          next if key == "DeveloperCertificates"

          parse_value = nil
          case value
          when Hash
            parse_value = value
          when Array
            parse_value = value
          else
            parse_value = value.to_s
          end

          result[:content][key] = parse_value
        end

      rescue => e
        puts e.message
        result = nil
      ensure
        tempfile.close and tempfile.unlink
      end
      return result
    end

    def collect_info_plist_info
      raise "IPA is not open" unless self.open?

      result = {
        path_in_ipa: nil,
        content: {}
      }
      info_plist_entry = @ipa_zipfile.find_entry("#{@app_folder_path}/Info.plist")

      raise "File 'Info.plist' not found in #{@ipa_path}" unless info_plist_entry
      result[:path_in_ipa] = "#{info_plist_entry}"

      tempfile = Tempfile.new(::File.basename(info_plist_entry.name))
      begin
        @ipa_zipfile.extract(info_plist_entry, tempfile.path){ override = true }
        # convert from binary Plist to XML Plist
        unless system("plutil -convert xml1 '#{tempfile.path}'")
          raise "Failed to convert binary Plist to XML"
        end
        plist = Plist::parse_xml(tempfile.path)

        plist.each do |key, value|
          parse_value = nil
          case value
          when Hash
            parse_value = value
          when Array
            parse_value = value
          else
            parse_value = value.to_s
          end

          result[:content][key] = parse_value
        end

      rescue => e
        puts e.message
        result = nil
      ensure
        tempfile.close and tempfile.unlink
      end
      return result
    end


    private
    #
    # Find the .app folder which contains both the "embedded.mobileprovision"
    #  and "Info.plist" files.
    def find_app_folder_in_ipa
      raise "IPA is not open" unless self.open?

      # Check the most common location
      app_folder_in_ipa = "Payload/#{File.basename(@ipa_path, File.extname(@ipa_path))}.app"

      mobileprovision_entry = @ipa_zipfile.find_entry("#{app_folder_in_ipa}/embedded.mobileprovision")
      info_plist_entry = @ipa_zipfile.find_entry("#{app_folder_in_ipa}/Info.plist")
      #
      if !mobileprovision_entry.nil? and !info_plist_entry.nil?
        return app_folder_in_ipa
      end

      # It's somewhere else - let's find it!
      @ipa_zipfile.dir.entries("Payload").each do |dir_entry|
        if dir_entry =~ /.app$/
          app_folder_in_ipa = "Payload/#{dir_entry}"
          mobileprovision_entry = @ipa_zipfile.find_entry("#{app_folder_in_ipa}/embedded.mobileprovision")
          info_plist_entry = @ipa_zipfile.find_entry("#{app_folder_in_ipa}/Info.plist")

          if !mobileprovision_entry.nil? and !info_plist_entry.nil?
            break
          end
        end
      end

      if !mobileprovision_entry.nil? and !info_plist_entry.nil?
        return app_folder_in_ipa
      end
      return nil
    end
  end
end

def parse_info_from_ipa(ipa_path)
  # get info.plist and provision
  ipa_analyzer = IpaAnalyzer::Analyzer.new(ipa_path)
  ipa_analyzer.open!
  info_plist = ipa_analyzer.collect_info_plist_info
  provision = ipa_analyzer.collect_provision_info
  ipa_analyzer.close

  ip_content = info_plist[:content]
  bundle_id    = ip_content["CFBundleIdentifier"]
  display_name = ip_content["CFBundleDisplayName"]
  version      = ip_content["CFBundleShortVersionString"]
  build        = ip_content["CFBundleVersion"]

  pv_content = provision[:content]
  all_device = pv_content["ProvisionsAllDevices"]

  return {
    bundle_id: bundle_id,
    display_name: display_name,
    version: version,
    build: build,
    all_device: all_device,
  }
end

def description_for_ipa(ipa = nil)
  # 使用 gym 打包後，會將 ipa/dysm 放置 ENV[IPA_OUTPUT_PATH] / ENV[DSYM_OUTPUT_PATH]
  ipa_name = ipa || ENV["IPA_OUTPUT_PATH"]
  ipa_path = file_path(ipa_name)
  ipa_info = parse_info_from_ipa(ipa_path)

  return ".ipa 资讯 => bundle_id: #{ipa_info[:bundle_id]}, name: #{ipa_info[:display_name]}, version: #{ipa_info[:version]}, build: #{ipa_info[:build]}, release_type: #{ipa_info[:all_device] ? "Inhouse" : "Adhoc"}"
end
