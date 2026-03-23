VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true
});

VSS.ready(function () {
    console.log("Azure DevOps SDK Ready");

    const webContext = VSS.getWebContext();
    const projectId = webContext.project ? webContext.project.id : "";
    const projectName = webContext.project ? webContext.project.name : "";

    const baseUrl =  "https://ai-aca-agt-prj0067566-wrkitm-bkd.orangeglacier-f13d9e59.eastus.azurecontainerapps.io";
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




               /* const data = {
                                    "work_item_type": "Bug",
                                    "project_name": "Phoenix Platform",
                                    "generated": {
                                      "title": "Fix intermittent timeout issue in payment service",
                                      "description": "## Summary\nInvestigate and resolve intermittent timeout errors occurring in the payment processing service under high load conditions.\n\n## Details\nThe issue appears when concurrent requests exceed threshold limits.",
                                      "valueStatement": "As a platform reliability engineer, we want stable payment processing so that users experience seamless transactions.",
                                      "acceptanceCriteria": [
                                        "Timeout errors reduced by at least 90% under load testing",
                                        "No regression in existing payment workflows",
                                        "Monitoring alerts configured for latency spikes"
                                      ],
                                      "tasks": [
                                        "Analyze logs to identify root cause",
                                        "Optimize database query performance",
                                        "Implement retry mechanism with exponential backoff",
                                        "Conduct load testing in staging environment"
                                      ],
                                      "assumptions": [
                                        "Load testing environment mimics production traffic patterns",
                                        "Database indexes can be modified without downtime"
                                      ],
                                      "dependencies": [
                                        "Access to production-like dataset",
                                        "Coordination with DevOps for load testing setup"
                                      ],
                                      "questions": [
                                        "What is the acceptable latency threshold for payment processing?",
                                        "Should we introduce circuit breaker pattern?"
                                      ],
                                      "confidence": 0.78
                                    },
                                    "ado_result": null,
                                    "error": null,
                                    "raw": null
                                  };

*/

                // Show raw API response
              /*  document.getElementById("apiResponse").textContent =
                    JSON.stringify(data, null, 2);*/

                // Populate preview
                populatePreview(data);

                document.getElementById("btnCreate").disabled = false;

                setStatus("Preview generated successfully.");

            } catch (error) {
                console.error(error);

                setStatus("Error calling AI backend.");

                /*document.getElementById("apiResponse").textContent =
                    "Error: " + error.message;*/
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
                   /* document.getElementById("apiResponse").textContent =
                        JSON.stringify(json, null, 2);*/

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
