/**
 * @see: https://octokit.github.io/rest.js/#octokit-routes-issues-create
 * const result = await octokit.issues.create({ owner, repo, title, [body], [assignees] })
 */
const flow = require('lodash.flow')
const commonYargs = require('../../lib/common-yargs')
const printOutput = require('../../lib/print-output')
const authenticatedOctokit = require('../../lib/octokit')

/**
 * yargs builder function.
 *
 * @param {import('yargs').Yargs} yargs - Instance of yargs
 */
const builder = yargs => {
	const baseOptions = flow([
		commonYargs.withGitHubUrl({
			describe: 'The URL of the GitHub repository to add an issue to.',
		}),
		commonYargs.withBody(),
		commonYargs.withTitle({ demandOption: true }),
	])
	return baseOptions(yargs)
		.option('assignees', {
			type: 'array',
			describe: 'GitHub user names to assign to the issue',
		})
		.example('github-url', 'Pattern: https://github.com/[owner]/[repository]')
}

/**
 * Return the contents of a pull request body and create a pull request.
 *
 * @param {object} argv - argv parsed and filtered by yargs
 * @param {string} argv.token
 * @param {string} argv.json
 * @param {string} argv.title
 * @param {string} argv.bodyContent — This is created in the withBody() yarg option middleware.
 * @param {array} argv.assignees — GitHub user names to assign to this issue.
 * @param {object} argv.githubUrl - The GitHub url parsed in the withGitHubUrl() yarg option into appropriate properties, such as `owner` and `repo`.
 */
const handler = async ({ token, json, title, bodyContent, assignees, githubUrl }) => {
	const { owner, repo } = githubUrl
	const inputs = {
		owner,
		repo,
		title,
		body: bodyContent,
		assignees,
	}
	try {
		const octokit = await authenticatedOctokit({ personalAccessToken: token })
		const result = await octokit.issues.create(inputs)
		printOutput({ json, resource: result })
	} catch (error) {
		printOutput({ json, error })
	}
}

module.exports = {
	command: 'create <github-url> [--title] [--body] [--assignees]',
	desc: 'Create a new issue',
	builder,
	handler,
}
