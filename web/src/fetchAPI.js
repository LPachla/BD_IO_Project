export async function fetchApi(action, method = "GET", body = null, queryParams = {}) {
    let options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body && !(body instanceof FormData)) {
        options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        };
    } else if (body instanceof FormData) {
        options = {
            method,
            body: body
        };
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

async function login(email, password) {
    const data = { email, password };
    const response = await fetchApi("login", "POST", data);
    if (response && response.error) {
        return { error: response.error };
    }
    return response;
}

async function isAdmin(user) {
    return user && user.role === 'admin';
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

async function insertAtrakcje(data, user) {
    if (!isAdmin(user)) {
        return { error: "Permission denied, only admin can add attractions" };
    }

    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    return await fetchApi("insertAtrakcje", "POST", formData);
}

async function deleteAtrakcje(data) {
    return await fetchApi("deleteAtrakcje", "DELETE", data);
}

async function updateUser(data) {
    return await fetchApi("updateUser", "PUT", data);
}

async function deleteUser(data) {
    return await fetchApi("deleteUser", "DELETE", data);
}

async function createUser(data) {
    return await fetchApi("createUser", "POST", data);
}

async function getUser() {
    return await fetchApi("getUser", "GET");
}

async function logout() {
    return await fetchApi("logout", "POST");
}

export {
    getPowiaty,
    getPowiatIDFromName,
    getAtrakcje,
    getZdjecia,
    insertAtrakcje,
    deleteAtrakcje,
    login,
    isAdmin,
    updateUser,
    deleteUser,
    createUser,
    getUser,
    logout
};
