VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true
});

VSS.ready(function () {
    console.log("Azure DevOps SDK Ready");

    const webContext = VSS.getWebContext();
    const projectId = webContext.project ? webContext.project.id : "";
    const projectName = webContext.project ? webContext.project.name : "";

    const baseUrl = "https://somebackend.com/service";
    const generateUrl = `${baseUrl}/generate`;

    // =========================
    // GENERATE BUTTON
    // =========================
    document.getElementById("btnGenerate")
        .addEventListener("click", async function () {

            const notes = document.getElementById("notes").value;
            const witType = document.getElementById("witType").value;

            if (!notes) {
                setStatus("Please enter notes before generating.");
                return;
            }

            setStatus("Generating work item content using AI...");

            try {
                const response = await fetch(generateUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        notes: notes,
                        work_item_type: witType,
                        create_in_ado: true,
                        project_name: projectName || "DevSecOpstools"
                    })
                });

                const data = await response.json();

                // Show raw API response
                document.getElementById("apiResponse").textContent =
                    JSON.stringify(data, null, 2);

                // Populate preview
                populatePreview(data);

                document.getElementById("btnCreate").disabled = false;

                setStatus("Preview generated successfully.");

            } catch (error) {
                console.error(error);

                setStatus("Error calling AI backend.");

                document.getElementById("apiResponse").textContent =
                    "Error: " + error.message;
            }
        });

    // =========================
    // UPLOAD BUTTON
    // =========================
    document.getElementById("btnUpload")
        .addEventListener("click", function () {
            document.getElementById("fileInput").click();
        });

    document.getElementById("fileInput")
        .addEventListener("change", function (event) {

            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const json = JSON.parse(e.target.result);

                    // Populate form fields
                    document.getElementById("witType").value =
                        json.work_item_type || "Task";

                    document.getElementById("notes").value =
                        json.generated?.description || "";

                    // Show raw JSON
                    document.getElementById("apiResponse").textContent =
                        JSON.stringify(json, null, 2);

                    // Populate preview
                    populatePreview(json);

                    setStatus("JSON uploaded and preview populated.");

                } catch (err) {
                    console.error(err);
                    setStatus("Invalid JSON file.");
                }
            };

            reader.readAsText(file);
        });

    VSS.notifyLoadSucceeded();
});

// =========================
// PREVIEW RENDERER
// =========================
function populatePreview(data) {

    const generated = data.generated || {};

    // Title
    document.getElementById("prevTitle").innerText =
        generated.title || "";

    // Description
    document.getElementById("prevDesc").innerText =
        generated.description || "";

    // Acceptance Criteria
    const acList = document.getElementById("prevAc");
    acList.innerHTML = "";
    if (Array.isArray(generated.acceptanceCriteria)) {
        generated.acceptanceCriteria.forEach(ac => {
            const li = document.createElement("li");
            li.innerText = ac;
            acList.appendChild(li);
        });
    }

    // Tasks
    const taskList = document.getElementById("prevTasks");
    taskList.innerHTML = "";
    if (Array.isArray(generated.tasks)) {
        generated.tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerText = task;
            taskList.appendChild(li);
        });
    }

    // Tags (not in your JSON but kept for extensibility)
    document.getElementById("prevTags").innerText = "";

    // Optional: Confidence
    if (generated.confidence) {
        setStatus(`Preview ready (Confidence: ${generated.confidence})`);
    }
}

// =========================
// STATUS HELPER
// =========================
function setStatus(message) {
    document.getElementById("status").innerText = message;
}
