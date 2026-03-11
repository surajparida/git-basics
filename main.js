VSS.init({
explicitNotifyLoaded: true,
usePlatformScripts: true
});

VSS.ready(function () {
console.log("Azure DevOps SDK Ready");

document.getElementById("btnGenerate")
    .addEventListener("click", async function () {

        const notes = document.getElementById("notes").value;
        const mode = document.getElementById("mode").value;
        const witType = document.getElementById("witType").value;

        if (!notes) {
            setStatus("Please enter notes before generating.");
            return;
        }

        setStatus("Generating work item content using AI...");

        try {

            const response = await fetch(
                "/api/work-items/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        notes: notes,
                        workItemType: witType,
                        extraContext: mode
                    })
                }
            );

            const data = await response.json();

            // Show raw API response at bottom
            document.getElementById("apiResponse").textContent =
                JSON.stringify(data, null, 2);

            // Populate preview if fields exist
            if (data.title)
                document.getElementById("prevTitle").innerText = data.title;

            if (data.description)
                document.getElementById("prevDesc").innerText = data.description;

            if (data.acceptanceCriteria && Array.isArray(data.acceptanceCriteria)) {
                const acList = document.getElementById("prevAc");
                acList.innerHTML = "";
                data.acceptanceCriteria.forEach(ac => {
                    const li = document.createElement("li");
                    li.innerText = ac;
                    acList.appendChild(li);
                });
            }

            if (data.tasks && Array.isArray(data.tasks)) {
                const taskList = document.getElementById("prevTasks");
                taskList.innerHTML = "";
                data.tasks.forEach(task => {
                    const li = document.createElement("li");
                    li.innerText = task;
                    taskList.appendChild(li);
                });
            }

            if (data.tags)
                document.getElementById("prevTags").innerText =
                    Array.isArray(data.tags) ? data.tags.join(", ") : data.tags;

            document.getElementById("btnCreate").disabled = false;
            document.getElementById("btnCopy").disabled = false;

            setStatus("Preview generated successfully.");

        } catch (error) {

            console.error(error);

            setStatus("Error calling AI backend.");

            document.getElementById("apiResponse").textContent =
                "Error: " + error.message;
        }

    });

VSS.notifyLoadSucceeded();

});

function setStatus(message) {
document.getElementById("status").innerText = message;
}
