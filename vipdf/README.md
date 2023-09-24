# ViPDF

## Chrome
For Chrome, build the extension normally and install with 
`Developer mode > Load unpacked` from `chrome://extensions`.

```bash
npm i && gulp chromium
# => ./build/chromium
```

## Firefox
Firefox (AFAIK) does not support the use of an alternative PDF viewer
(that is not an external program). To use a pdf.js fork one can:

1. Build Firefox from source with a custom pdf.js version
2. Load pdf files via a hosted instance of pdf.js

The [server.js](/vipdf/server.js) script provides a way to accomplish (2).
An accompanying user script that replaces all PDF links with links
that use ViPDF is also provided in [vipdf.user.js](/vipdf/vipdf.user.js).

```bash
node vipdf/server.js
open "http://localhost:9449/vi?file=$uri"
```

## Notes
To rebase changes on top of the upstream:
```bash
git remote add upstream git@github.com:mozilla/pdf.js.git

git fetch upstream
git checkout master
git rebase upstream/master
```

Lint before committing
```bash
gulp lint --fix
```
