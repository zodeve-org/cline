import * as vscode from "vscode"

type StoreData = Record<string, any>

export class SecretStore implements vscode.SecretStorage {
	private fileUri: vscode.Uri
	private fileName: string = "secrets.json"
	private readonly emitter = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>()

	constructor(private context: vscode.ExtensionContext) {
		this.fileUri = vscode.Uri.joinPath(context.globalStorageUri, this.fileName)
	}

	onDidChange = this.emitter.event

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

	async get<T = any>(key: string): Promise<T | undefined> {
		const data = await this.readFile()
		return data[key]
	}

	async store(key: string, value: any): Promise<void> {
		const data = await this.readFile()
		data[key] = value
		await this.writeFile(data)
		this.emitter.fire({ key })
	}

	async delete(key: string): Promise<void> {
		const data = await this.readFile()
		delete data[key]
		await this.writeFile(data)
		this.emitter.fire({ key })
	}
}
