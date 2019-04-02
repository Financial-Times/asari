const yargs = require("yargs")
const nock = require('nock');
const yargsModule = require("../../../src/commands/pulls/createReviewRequest")

// Don't let Octokit make network requests
nock.disableNetConnect();

jest.spyOn(global.console, "warn");
afterEach(() => {
	jest.clearAllMocks();
});

describe("Yargs", () => {
	test("`pulls createReviewRequest` command module exports an object that can be used by yargs", () => {
		expect(yargsModule).toEqual(
			expect.objectContaining({
				command: expect.stringMatching("pulls createReviewRequest"),
				desc: expect.any(String),
				builder: expect.any(Function),
				handler: expect.any(Function),
			})
		)
	})

	test("yargs can load the `pulls createReviewRequest` command without any errors or warnings", () => {
		expect(() => {
			yargs.command(
				yargsModule.command,
				yargsModule.desc,
				yargsModule.builder,
				yargsModule.handler
			).argv
		}).not.toThrow()
		expect(console.warn).not.toBeCalled()
	})

	test("running the command handler without `owner` to throw an error", async () => {
		expect.assertions(1)
		try {
			await yargsModule.handler({
				repo: "https://github.com/octocat",
				title: "Test: Error expected",
				branch: "test-branch"
			})
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
		}
	})

	test("running the command handler without `repo` to throw an error", async () => {
		expect.assertions(1)
		try {
			await yargsModule.handler({
				owner: "Octocat",
				title: "Test: Error expected",
				branch: "test-branch"
			})
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
		}
	})

	test("running the command handler without `title` to throw an error", async () => {
		expect.assertions(1)
		try {
			await yargsModule.handler({
				owner: "Octocat",
				repo: "https://github.com/octocat",
				branch: "test-branch"
			})
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
		}
	})

	test("running the command handler without `branch` to throw an error", async () => {
		expect.assertions(1)
		try {
			await yargsModule.handler({
				owner: "Octocat",
				repo: "https://github.com/octocat",
				title: "Test: Error expected",
			})
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
		}
	})
})

describe("Octokit", () => {

	// If this endpoint is not called, nock.isDone() will be false.
	nock('https://api.github.com')
		.persist()
		.post('/repos/test/test/pulls/1/requested_reviewers')
		.reply(200, {})

	test("running the command handler triggers a network request of the GitHub API", async () => {
		await yargsModule.handler({
			token: "test",
			owner: "test",
			repo: "test",
			number: 1,
			reviewers: "test",
		})
		expect(nock.isDone()).toBe(true)
	})
})
