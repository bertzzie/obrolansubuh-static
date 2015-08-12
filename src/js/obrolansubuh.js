export class ToastNotification {
	constructor(parentElement, content, duration, isError) {
    	this.notif = document.createElement("paper-toast"),
    	this.label = document.createElement("span");

    	this.notif.setAttribute("duration", duration);

        if (isError) {
        	this.notif.classList.add("error");
        }

    	this.label.setAttribute("id", "label");
    	this.label.classList.add("style-scope");
    	this.label.classList.add("paper-toast");

    	this.label.textContent = content;

    	this.notif.appendChild(this.label);
    	parentElement.appendChild(this.notif);

    	return this;
	}
	Show(element) {
		setTimeout(() => { this.notif.show(); }, 500);
	}
}

export class CommonClosures {
    static FileUploadHandler({
        FileInputElem:  fileInput, 
        OnError:        onError,
        OnSuccess:      onSuccess,
        OnFailure:      onFailure
    }) {
        return function (event) {
            let file  = fileInput.files[0]; // user may only select one file!
            let formD = new FormData();

            if (!file.type.match("image*")) {
                return onError();
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
                    success: function (response) { onSuccess(response); },
                    error: function (jqXHR, textStatus, errorMessage) {
                        onFailure(jqXHR, textStatus, errorMessage);
                    }
                });
            }
        }
    }
}