import * as vscode from "vscode"
import { GlobalStateStore } from "@/store/GlobalStateStore"
import { SecretStore } from "@/store/SecretStore"

export async function updateContextStores(ctx: vscode.ExtensionContext): Promise<vscode.ExtensionContext> {
	const secretStore = new SecretStore(ctx)
	const globalState = new GlobalStateStore(ctx)
	await globalState.init()

	const context = {
		...ctx,
		secrets: secretStore,
		globalState: globalState,
	} satisfies vscode.ExtensionContext
	return context
}
