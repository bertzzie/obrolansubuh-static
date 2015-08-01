import * as OS from "./obrolansubuh"

(function () {
	"use strict";

	window.addEventListener("WebComponentsReady", function (evt) {
		var mainDrawerPanel = document.querySelector("#main-drawer-panel"),
			aboutusTitle    = document.querySelector("input#aboutus-title"),
		    mainTitle       = document.querySelector("#main-panel-title");

		mainDrawerPanel.forceNarrow = true;
		mainDrawerPanel.closeDrawer();

		if (aboutusTitle.value.length > 0) {
			mainTitle.textContent = aboutusTitle.value;
			document.title = aboutusTitle.value;
		}

		aboutusTitle.addEventListener("keyup", function (evt) {
			var title = "About Us";
			if (aboutusTitle.value.length > 0) {
				title = aboutusTitle.value;
			} 

			mainTitle.textContent = title;
			document.title = title;
		})
	});

	var aboutusEditor = document.querySelector("#aboutus-editor");
	aboutusEditor.addEventListener("image-upload-failed", function (evt) {
		// This comes from the plugin we use. Event data is exposed 
		// naked to the user (us) so we can have better control.
		// See https://github.com/blueimp/jQuery-File-Upload/wiki/Options
		var error = evt.detail.jqXHR.responseJSON["files"][0],
			// current uploading image
		    elem  = document.querySelector(".medium-insert-active");

		var ToastNotif = new OS.ToastNotification(
			document.querySelector("#flash-container"),
			error["error"],
			5000,
			true
		);

		ToastNotif.Show();

		elem.parentElement.removeChild(elem);
	});

	var update = document.querySelector("#update");
	if (update) {
		update.addEventListener("click", CreatePostSubmitListener(
			document.querySelector("input#aboutus-title"),
			document.querySelector("#aboutus-editor")
		));
	}

	function CreatePostSubmitListener(titleElem, editorElem) {
		return (evt) => {
			var postData = {
				title: titleElem.value,
				content: editorElem.getEditorContent()
			},
			parent = document.querySelector("#flash-container"),
			ToastNotif;

			$.post("/site-info/edit/about-us", postData, (data, textStatus, jqXHR) => {
				var message = jqXHR.responseJSON["message"];

				ToastNotif = new OS.ToastNotification(parent, message, 5000, false);
			
			})
			.fail((jqXHR, textStatus, errorThrown) => {
				var message = jqXHR.responseJSON["messages"][0];

				ToastNotif = new OS.ToastNotification(parent, message, 5000, true);
			})
			.always(() => { ToastNotif.Show(); });

			evt.preventDefault();
		}
	}
})();