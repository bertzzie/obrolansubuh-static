import * as OS from "./obrolansubuh"

(function () {
	"use strict";
	let phDatas    = {}; // placeholder original texts
	let imageURL   = "";
	let textInputs = document.querySelectorAll("input[type='text'].transparent");
	let catImage   = document.querySelector("#category-image");
	let saveCat    = document.querySelector("#save-category");
	let updateCat  = document.querySelector("#update-category");

	function CreateInputPlaceholderHanlder(element, index) {
		element.addEventListener("focus", function () {
			element.placeholder = "";
		});

		element.addEventListener("blur", function () {
			if (element.value === "") {
				element.placeholder = phDatas[index];
			}
		});
	}

	function getURLPath(url) {
		let a = document.createElement("a");
		a.href = url;

		return a.pathname;
	}

	for (let i = 0; i < textInputs.length; i += 1) {
		let txt = textInputs.item(i);
		if (txt) {
			phDatas[i] = txt.placeholder;
			CreateInputPlaceholderHanlder(txt, i);
		}
	}

	if (updateCat) {
		updateCat.addEventListener("click", function (evt) {
			evt.preventDefault();

			let formD = new FormData();
			formD.append("id", document.querySelector("#category-id").value);
			formD.append("heading", document.querySelector("#category-heading").value);
			formD.append("description", document.querySelector("#category-description").value);

			if (imageURL) {
				formD.append("image", getURLPath(imageURL));
			}

			$.ajax({
				url: "/category/update",
				type: "POST",
				data: formD,
				cache: false,
				contentType: false,
				processData: false,
				success: function (response) {
					let ToastNotif = new OS.ToastNotification(
						document.querySelector("#flash-container"),
					"Category Updated!", // TODO: Internationalization from client side
					5000,
					false
					);

					ToastNotif.Show();
					return;
				},
				error: function (jqXHR, textStatus, errorMessage) {
					let error = jqXHR.responseJSON["messages"].join(", ");
					let ToastNotif = new OS.ToastNotification(
						document.querySelector("#flash-container"),
						error,
						5000,
						true
						);

					ToastNotif.Show();
					return;
				}
			});
		});
	}

	if (saveCat) {
		saveCat.addEventListener("click", function (evt) {
			evt.preventDefault();

			let formD = new FormData();
			formD.append("heading", document.querySelector("#category-heading").value);
			formD.append("description", document.querySelector("#category-description").value);

			if (imageURL) {
				formD.append("image", getURLPath(imageURL));
			}

			$.ajax({
				url: "/category/new",
				type: "POST",
				data: formD,
				cache: false,
				contentType: false,
				processData: false,
				success: function (response) {
					let ToastNotif = new OS.ToastNotification(
						document.querySelector("#flash-container"),
						"New Category Added!", // TODO: Internationalization from client side
						5000,
						false
					);

					ToastNotif.Show();
					return;
				},
				error: function (jqXHR, textStatus, errorMessage) {
					let error = jqXHR.responseJSON["messages"].join(", ");
					let ToastNotif = new OS.ToastNotification(
						document.querySelector("#flash-container"),
						error,
						5000,
						true
					);

					ToastNotif.Show();
					return;
				}
			});
		})
	}

	catImage.addEventListener("change", OS.CommonClosures.FileUploadHandler({
		FileInputElem:  catImage, 
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
            let imageContainer = document.querySelector("#category-image-container");

            imageURL = url;

            // The background-image string concat is not safe, but this is javascript. 
            // So, what's safety anyway?
            //
            // TODO: Find a safer way to do this
            imageContainer.style["background-image"]    = "url(" + url + ")";
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
})();