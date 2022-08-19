import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const newBranch = "test1";
const oldBranch = "main";
const owner = "Alwin24";
const repo = "api-test";

try {
    axios.defaults.headers.post['Authorization'] = `token ${GITHUB_TOKEN}`;

    let response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${oldBranch}`)
    let sha = response.data.object.sha;

    console.log(response.data, sha);

    response = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${newBranch}`,
        sha,
    })
    let url = response.data.object.url;

    await axios.post(`https://api.vercel.com/v9/projects/${repo}/domains`, {
        name: `staking-${newBranch}.vercel.app`,
        gitBranch: newBranch
    }, {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    })

    let blob = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        content: "PROJECT_KEY = abcd1234",
        encoding: "utf-8",
    })
    let tree = await axios.get(url);

    let newTree = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
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

    let newCommit = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        message: "Adding env",
        parents: [sha],
        tree: newTree.data.sha
    })

    await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${newBranch}`, {
        sha: newCommit.data.sha
    })
} catch (error) {
    console.log(error);
}
