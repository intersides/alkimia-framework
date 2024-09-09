update-package:
	git add . && git commit -m "Updates" && npm version patch && npm publish

_update-package-no-commit:
	git add . && npm version patch && npm publish

patch_and_publish:
	npm version patch && npm publish

update-package-no-commit:
	npm publish
