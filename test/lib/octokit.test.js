const nock = require('nock');
const octokit = require("../../lib/octokit")

// Don't let Octokit make network requests
nock.disableNetConnect();

describe("lib/octokit.js", () => {
	test("Calling octokit() without a personalAccessToken throws an error", async () => {
		expect.assertions(1)
		try {
			await octokit({})
		}
		catch (error) {
			expect(error).toBeInstanceOf(Error)
		}
	})

	test("Calling octokit() returns an instance of Octokit", async () => {
		const github = await octokit({ personalAccessToken: "incorrectToken" })
		expect(github).toMatchSnapshot()
	})

	test("Calling octokit() triggers a POST network request to https://api.github.com", async () => {

		// If this endpoint is not called, nock.isDone() will be false.
		nock('https://api.github.com')
			.persist()
			.post('/repos/test/test/pulls')
			.reply(200, {})

		const github = await octokit({ personalAccessToken: "incorrectToken" })
		const result = await github.pulls.create({
			owner: "test",
			repo: "test",
			title: "test",
			head: "test",
			base: "test",
			body: "test",
		})
		expect(nock.isDone()).toBe(true)
	})
})
