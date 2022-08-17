import axios from "axios";
const ACCESS_TOKEN = "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";
const branchName = "test1";
axios.defaults.headers.post['Authorization'] = `token ${ACCESS_TOKEN}`;

let response = await axios.get("https://api.github.com/repos/Alwin24/api-test/git/refs/heads/main")
let sha = response.data.object.sha;

console.log(response.data, sha);

response = await axios.post("https://api.github.com/repos/Alwin24/api-test/git/refs", {
    ref: `refs/heads/${branchName}`,
    sha,
})
let url = response.data.object.url;

let blob = await axios.post("https://api.github.com/repos/Alwin24/api-test/git/blobs", {
    content: "PROJECT_KEY = abcd1234",
    encoding: "utf-8",
})
let tree = await axios.get(url);

let newTree = await axios.post("https://api.github.com/repos/Alwin24/api-test/git/trees", {
    base_tree: tree.data.tree.sha,
    tree: [
        {
            path: ".env",
            mode: "100644",
            type: "blob",
            sha: blob.data.sha
        }
    ]
})

let newCommit = await axios.post("https://api.github.com/repos/Alwin24/api-test/git/commits", {
    message: "Adding env",
    parents: [sha],
    tree: newTree.data.sha
})

await axios.post(`https://api.github.com/repos/Alwin24/api-test/git/refs/heads/${branchName}`, {
    sha: newCommit.data.sha
})