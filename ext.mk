# TODO: The extension works for http:// URIs (ish) but cannot open local files...
.PHONY: firefox chromium release debug

SHELL=/bin/bash

MOZILLA_JWT=~/.secret/mozilla.jwt
MOZILLA_ISSUER=~/.secret/mozilla_issuer

chromium:
	gulp chromium

# 'mozcentral' seems to be a CDN version?
# gulp mozcentral
# cp ./extensions/firefox/manifest.json 					./build/firefox
# cp -r  ./build/mozcentral/browser/extensions/pdfjs/content/* 		./build/firefox/content
firefox:
	mkdir -p ./build/firefox
	if ! [ -d ./build/firefox/options ]; then \
		gulp chromium ;\
		cp -r  ./build/chromium/* 		./build/firefox ;\
		rm -rf ./build/firefox/content/* ;\
	fi;
	gulp generic
	cp ./extensions/firefox/manifest.json 	./build/firefox
	cp -r  ./build/generic/* 		./build/firefox/content
	web-ext build -s ./build/firefox --overwrite-dest

# The extension SID is randomized each time, we can identify it from about:config in 'extensions.webextensions.uuids'
#
# This user.js fix does not solve the issue with a custom pdf.js version either
#
# user_pref("capability.policy.policynames", "filelinks");
# user_pref("capability.policy.filelinks.checkloaduri.enabled", "allAccess");
# user_pref("capability.policy.filelinks.sites", "moz-extension://f32e368b-ad5b-4d4f-993a-c178686fcf3a");
debug: firefox
	echo extensions.webextensions.uuids|pbcopy 
	web-ext run -s ./build/firefox  \
		--pref browser.aboutConfig.showWarning=false --pref browser.warnOnQuitShortcut=false \
		--start-url "about:addons" --start-url "about:config" --start-url "moz-extension://REPLACE/content/web/viewer.html?file=file:///Users/jonas/Documents/XeT/gp/lab1/main.pdf"

# Sign the extension and place it under ./web-ext-artifacts
# It may be neccessary to bump the 'version' in ./extension/firefox/manifest.json for the signing to work
release: firefox
	web-ext sign -s ./build/firefox --api-key $(shell cat $(MOZILLA_ISSUER)) --api-secret $(shell cat $(MOZILLA_JWT))
	echo "XPI available under ./web-ext-artifacts/"
