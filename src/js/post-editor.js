import * as OS from "./obrolansubuh"

(function () {
	"use strict";

	window.addEventListener("DOMContentLoaded", function (evt) {
		let category = document.querySelector("select#post-category");
		let oldCat   = document.querySelector("input#post-category-old");

		$.ajax({
			url         : "/category/list.json",
			type        : "GET",
			success     : (data, textStatus, jqXHR) => {
				data.forEach(function (value, index, array) {
					let text = value["Heading"] + " - " + value["Description"];

					category.options[category.options.length] = new Option(text, value["ID"]);
					if (oldCat) {
						category.value = oldCat.value;
					}
				});
			},
			error       : (jqXHR, textStatus, errorThrown) => {
				var message = jqXHR.responseJSON["messages"][0];

				ToastNotif = new OS.ToastNotification(parent, message, 5000, true);
				ToastNotif.Show();
			}
		})
	});

	window.addEventListener("WebComponentsReady", function (evt) {
		var mainDrawerPanel = document.querySelector("#main-drawer-panel"),
			postTitle = document.querySelector("input#post-title"),
		    mainTitle = document.querySelector("#main-panel-title");

		mainDrawerPanel.forceNarrow = true;
		mainDrawerPanel.closeDrawer();

		if (postTitle.value.length > 0) {
			mainTitle.textContent = postTitle.value;
			document.title = postTitle.value;
		}

		postTitle.addEventListener("keyup", function (evt) {
			var title = "Untitled";
			if (postTitle.value.length > 0) {
				title = postTitle.value;
			} 

			mainTitle.textContent = title;
			document.title = title;
		})
	});

	var coverImage = document.querySelector("#cover-image");
	coverImage.addEventListener("change", OS.CommonClosures.FileUploadHandler({
		FileInputElem: coverImage,
		OnError: function () {
            let ToastNotif = new OS.ToastNotification(
                document.querySelector("#flash-container"),
                "You must upload image file!", // TODO: Internationalization from client side
                5000,
                true
            );

            ToastNotif.Show();
            return;
		},
		OnSuccess: function (response) {
            // can only upload 1 file. download will only be 1 file
            let url = response["files"][0]["url"];
            let imageContainer = document.querySelector("#post-heading");
            let imageURLValue  = document.querySelector("#cover-image-url");

            // The background-image string concat is not safe, but this is javascript. 
            // So, what's safety anyway?
            //
            // TODO: Find a safer way to do this
            imageContainer.style["background-image"]    = "url(" + url + ")";
            imageURLValue.value = url;
		},
		OnFailure: function (jqXHR, textStatus, errorMessage) {
            let error = jqXHR.responseJSON["files"][0];
            let ToastNotif = new OS.ToastNotification(
                document.querySelector("#flash-container"),
                error["error"],
                5000,
                true
            );

            ToastNotif.Show();
		}
	}));

	var postEditor = document.querySelector("#post-editor");
	postEditor.addEventListener("image-upload-failed", function (evt) {
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

	var publishButton = document.querySelector("#publish-post");
	if (publishButton) {
		publishButton.addEventListener("click", CreatePostSubmitListener(
			document.querySelector("#cover-image-url"),
			document.querySelector("input#post-title"),
			document.querySelector("#post-editor"),
			document.querySelector("select#post-category"),
			true
		));
	}

	var draftButton = document.querySelector("#save-draft");
	if (draftButton) {
		draftButton.addEventListener("click", CreatePostSubmitListener(
			document.querySelector("#cover-image-url"),
			document.querySelector("input#post-title"),
			document.querySelector("#post-editor"),
			document.querySelector("select#post-category"),
			false
		));
	}

	var updateButton = document.querySelector("#update-post");
	if (updateButton) {
		updateButton.addEventListener("click", CreatePutSubmitListener(
			document.querySelector("#cover-image-url"),
			document.querySelector("input#post-title"),
			document.querySelector("#post-editor"),
			document.querySelector("input#post-id"),
			document.querySelector("select#post-category"),
			document.querySelector("input#post-publish").value
		));
	}

	function CreatePutSubmitListener(imageElem, titleElem, editorElem, idElem, catElem, publish) {
		return (evt) => {
			var id = idElem.value,
				data = {
					id        : parseInt(id),
					title     : titleElem.value,
					content   : editorElem.getEditorContent(),
					category  : catElem.value,
					published : publish === "true",
					cover     : imageElem.value
				}, 
				parent = document.querySelector("#flash-container"),
				ToastNotif;

			$.ajax({
				url         : "/post/" + id + "/edit",
				type        : "PUT",
				data        : JSON.stringify(data),
				contentType : "application/json",
				success     : (data, textStatus, jqXHR) => {
					var text  = jqXHR.responseJSON["message"];

					ToastNotif = new OS.ToastNotification(parent, text, 5000, false);
				},
				error       : (jqXHR, textStatus, errorThrown) => {
					var message = jqXHR.responseJSON["messages"][0];

					ToastNotif = new OS.ToastNotification(parent, message, 5000, true);
				}
			}).always(() => { ToastNotif.Show(); });

			evt.preventDefault();
		}
	}

	function CreatePostSubmitListener(imageElem, titleElem, editorElem, catElem, publish) {
		return (evt) => {
			var postData = {
				title     : titleElem.value,
				category  : catElem.value,
				content   : editorElem.getEditorContent(),
				publish   : publish,
				cover     : imageElem.value
			}, ToastNotif;

			$.post("/post/new", postData, (data, textStatus, jqXHR) => {
				window.location.replace(data["links"][0]["uri"]);
			})
			.fail((jqXHR, textStatus, errorThrown) => {
				var parent  = document.querySelector("#flash-container"),
				    message = jqXHR.responseJSON["messages"][0];

				ToastNotif = new OS.ToastNotification(parent, message, 5000, true);
			})
			.always(() => { ToastNotif.Show(); });

			evt.preventDefault();
		}
	}
})();