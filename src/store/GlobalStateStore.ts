import * as vscode from "vscode"

type StoreData = Record<string, any>

interface SetKeysForSync {
	setKeysForSync(keys: readonly string[]): void
}

export class GlobalStateStore implements vscode.Memento, SetKeysForSync {
	private fileUri: vscode.Uri
	private cache: StoreData = {}
	private fileName: string = "globalState.json"
	private syncKeys: readonly string[] = []

	constructor(private context: vscode.ExtensionContext) {
		this.fileUri = vscode.Uri.joinPath(context.globalStorageUri, this.fileName)
		console.log("globalStateUri", this.fileUri)
	}

	async init(): Promise<void> {
		this.cache = await this.readFile()
	}

	private async readFile(): Promise<StoreData> {
		try {
			const bytes = await vscode.workspace.fs.readFile(this.fileUri)
			const raw = Buffer.from(bytes).toString("utf8")
			return JSON.parse(raw)
		} catch (err: any) {
			if (err?.code === "FileNotFound") return {}
			return {}
		}
	}

	private async writeFile(data: StoreData) {
		await vscode.workspace.fs.createDirectory(this.context.globalStorageUri)

		const raw = JSON.stringify(data, null, 2)
		await vscode.workspace.fs.writeFile(this.fileUri, Buffer.from(raw, "utf8"))
	}

	keys(): readonly string[] {
		return Object.keys(this.cache)
	}

	get<T>(key: string): T | undefined
	get<T>(key: string, defaultValue: T): T
	get<T>(key: string, defaultValue?: T): T | undefined {
		const val = this.cache[key]
		return (val as T) ?? defaultValue
	}

	async update(key: string, value: any): Promise<void> {
		if (value === undefined) delete this.cache[key]
		else this.cache[key] = value

		await this.writeFile(this.cache)
	}

	setKeysForSync(keys: readonly string[]): void {
		this.syncKeys = keys
	}

	async set(key: string, value: any): Promise<void> {
		await this.update(key, value)
	}

	async delete(key: string): Promise<void> {
		await this.update(key, undefined)
	}
}
