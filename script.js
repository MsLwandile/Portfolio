const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const projectDialog = document.querySelector(".project-dialog");
const projectDialogTitle = document.querySelector("#project-dialog-title");
const projectDialogContent = document.querySelector(".project-dialog-content");
const projectDialogClose = projectDialog.querySelector(".project-dialog-close");
let lastProjectTrigger = null;

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
    }
});

document.querySelectorAll(".project-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const detailTemplate = document.getElementById(trigger.dataset.projectDetails);
        const projectTitle = trigger.querySelector(".project-title");

        if (!detailTemplate || detailTemplate.tagName !== "TEMPLATE" || !projectTitle) {
            console.error(`Project details could not be opened for "${projectTitle?.textContent ?? "unknown project"}": check its template ID and project title.`);
            return;
        }

        projectDialogTitle.textContent = projectTitle.textContent;
        projectDialogContent.replaceChildren(detailTemplate.content.cloneNode(true));
        const demoVideo = projectDialogContent.querySelector(".project-demo video");

        if (demoVideo instanceof HTMLVideoElement) {
            const demoContainer = demoVideo.closest(".project-demo");
            const status = demoContainer.querySelector(".project-demo-status");
            const videoPath = demoVideo.dataset.videoSrc;

            status.textContent = "Loading demo video…";
            status.hidden = false;

            demoVideo.addEventListener("loadedmetadata", async () => {
                demoContainer.classList.add("has-video");
                try {
                    await demoVideo.play();
                    status.hidden = true;
                } catch (error) {
                    status.textContent = "Demo video is ready. Press play to start.";
                    status.hidden = false;
                    console.warn("The project demo video could not autoplay.", error);
                }
            }, { once: true });

            demoVideo.addEventListener("error", () => {
                demoContainer.classList.remove("has-video");
                status.textContent = window.location.protocol === "file:"
                    ? "Open this portfolio through a local web server to play videos. From the project folder, run `py -m http.server 8000`, then open http://localhost:8000."
                    : `Could not load the demo video at "${videoPath}".`;
                status.hidden = false;
            }, { once: true });

            demoVideo.src = videoPath;
        }

        lastProjectTrigger = trigger;
        projectDialog.showModal();
        projectDialog.querySelector(".project-dialog-close").focus();
    });
});

projectDialogClose.addEventListener("click", () => {
    projectDialog.close();
});

projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) {
        projectDialog.close();
    }
});

projectDialog.addEventListener("close", () => {
    projectDialogContent.querySelectorAll("video").forEach((video) => video.pause());
    projectDialogTitle.textContent = "";
    projectDialogContent.replaceChildren();
    lastProjectTrigger?.focus();
});

document.querySelector("#year").textContent = new Date().getFullYear();
