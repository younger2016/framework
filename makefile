#!/bin/bash
echo "Start building the App"
echo "Step1: remove node-modules and reinstall the packages"
rm -rf node-modules && yarn install
echo "Step2: react-native link"
react-native link
echo "Step3: run fastlane"
source ~/.bash_profile
fastlane publish_to_pgyer_development
