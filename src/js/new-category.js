import * as OS from "./obrolansubuh"

(function () {
	"use strict";
	let phDatas    = {}; // placeholder original texts
	let imageURL   = "";
	let textInputs = document.querySelectorAll("input[type='text'].transparent");
	let catImage   = document.querySelector("#category-image");
	let saveCat    = document.querySelector("#save-category");

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

	saveCat.addEventListener("click", function (evt) {
		evt.preventDefault();

		let formD = new FormData();
		formD.append("heading", document.querySelector("#category-heading").value);
		formD.append("description", document.querySelector("#category-description").value);

		if (imageURL) {
			formD.append("image", "/" + getURLPath(imageURL));
		}

		$.ajax({
			url: "/category/save",
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

	catImage.addEventListener("change", function (evt) {
		let file  = catImage.files[0]; // user may only select one file!
		let formD = new FormData();

		if (!file.type.match("image*")) {
			let ToastNotif = new OS.ToastNotification(
				document.querySelector("#flash-container"),
				"You must upload image file!", // TODO: Internationalization from client side
				5000,
				true
			);

			ToastNotif.Show();
			return;
		}

		if (file) {
			formD.append('image', file, file.name);
			
			$.ajax({
				url: "/assets/image/upload",
				type: "PUT",
				data: formD,
				cache: false,
				contentType: false,
				processData: false,
				success: function (response) {
					// can only upload 1 file. download will only be 1 file
					let url = response["files"][0]["url"];
					let newcat = document.querySelector("#new-category");

					imageURL = url;

					// The background-image string concat is not safe, but this is javascript. 
					// So, what's safety anyway?
					//
					// TODO: Find a safer way to do this
					newcat.style["background-image"]    = "url(" + url + ")";
					newcat.style["background-position"] = "top center";
					newcat.style["background-repeat"]   = "no-repeat";
					newcat.style["background-size"]     = "1000px";
					newcat.style["height"]              = "80%";
				},
				error: function (jqXHR, textStatus, errorMessage) {
					let error = jqXHR.responseJSON["files"][0];
					let ToastNotif = new OS.ToastNotification(
						document.querySelector("#flash-container"),
						error["error"],
						5000,
						true
					);

					ToastNotif.Show();
				}
			});
		}
	});
})();