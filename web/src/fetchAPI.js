export async function fetchApi(action, method = "GET", body = null, queryParams = {}) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const query = new URLSearchParams({ action, ...queryParams }).toString();

    const url = `../api/index.php?${query}`;

    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (err) {
        console.error("Fetch error:", err);
        return { error: "Connection Error with API" };
    }
}

async function getPowiaty() {
    return await fetchApi("powiaty");
}

async function getPowiatIDFromName(data) {
    return await fetchApi("getPowiatIDFromName", "GET", null, { powiat: data.powiat });
}

async function getAtrakcje() {
    return await fetchApi("atrakcje");
}

async function getZdjecia() {
    return await fetchApi("zdjecia");
}

async function insertAtrakcje(data) {
    return await fetchApi(null, "POST", data);
}

async function deleteAtrakcje(data) {
    return await fetchApi(null, "DELETE", data);
}

export {
    getPowiaty,
    getPowiatIDFromName,
    getAtrakcje,
    getZdjecia,
    insertAtrakcje,
    deleteAtrakcje
};

