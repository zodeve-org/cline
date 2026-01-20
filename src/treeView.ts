import * as vscode from "vscode"

export function createTreeView(command: string) {
	vscode.window.createTreeView("claude-dev.ActivityBarProvider", {
		treeDataProvider: {
			getChildren() {
				return [
					{
						label: "Focus Cline (Sidebar)",
						command: {
							command: command,
							title: "Focus Cline (Sidebar)",
						},
					},
				]
			},
			getTreeItem(item: any) {
				return item
			},
		},
	})
}
