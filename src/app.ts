import type { IDL, Account, Instruction, Type, ErrorType, Event, TypeNode, Program } from './types';
import { isTypeNodeObject } from './types';
import './styles.css';

class IDLViewer {
    private idlContent: HTMLElement;
    private fileInput: HTMLInputElement;
    private currentProgram: Program | null = null;

    constructor() {
        this.idlContent = document.getElementById('idlContent')!;
        this.fileInput = document.getElementById('idlFile') as HTMLInputElement;
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        // Add click handlers for collapsible sections
        document.querySelectorAll('.section h2').forEach((header) => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section?.classList.toggle('collapsed');
            });
        });

        this.fileInput.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const idl = JSON.parse(e.target?.result as string) as IDL;
                    this.displayIDL(idl);
                } catch (error) {
                    this.showError(`Error parsing JSON file: ${error instanceof Error ? error.message : String(error)}`);
                }
            };
            reader.readAsText(file);
        });
    }

    private isStandardProgram(program: Program): boolean {
        // TODO: expand the list
        const standardPrograms = [
            '11111111111111111111111111111111', // System Program
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
            'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metadata Program
        ];
        return standardPrograms.includes(program.publicKey || '');
    }

    private generateTypeScriptCode(entity: Account | Instruction | Event, type: 'account' | 'instruction' | 'event'): string {
        if (!this.currentProgram) return '';

        if (this.isStandardProgram(this.currentProgram)) {
            alert('Code generation is not applicable for standard Solana programs');
            return '';
        }

        switch (type) {
            case 'account':
                return this.generateTypeScriptAccountCode(entity as Account);
            case 'instruction':
                return this.generateTypeScriptInstructionCode(entity as Instruction);
            case 'event':
                return this.generateTypeScriptEventCode(entity as Event);
            default:
                return '';
        }
    }

    private generateTypeScriptAccountCode(account: Account): string {
        return `// Fetch account data
const account = await program.account.${account.name}.fetch(accountAddress);
console.log('Account data:', account);`;
    }

    private generateTypeScriptInstructionCode(instruction: Instruction): string {
        const args = instruction.args || instruction.arguments || [];
        const accounts = instruction.accounts || [];

        return `// Call instruction
const tx = await program.methods
    .${instruction.name}(${args.map(arg => arg.name).join(', ')})
    .accounts({
        ${accounts.map(acc => `${acc.name}: ${acc.name}Pubkey`).join(',\n        ')}
    })
    .instruction();

console.log('Instruction:', tx);`;
    }

    private generateTypeScriptEventCode(event: Event): string {
        return `// Subscribe to event
program.addEventListener("${event.name}", (event) => {
    console.log('Event received:', event);
});`;
    }

    private addCopyButton(container: HTMLElement, entity: Account | Instruction | Event, type: 'account' | 'instruction' | 'event'): void {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = '📋 Copy Code';
        button.addEventListener('click', () => {
            const code = this.generateTypeScriptCode(entity, type);
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    button.innerHTML = '✓ Copied!';
                    setTimeout(() => {
                        button.innerHTML = '📋 Copy Code';
                    }, 2000);
                });
            }
        });
        container.appendChild(button);
    }

    private displayIDL(idl: IDL): void {
        this.clearAllSections();

        // Handle different IDL formats
        const programData = idl.program || idl;
        this.currentProgram = programData;

        if (programData.accounts) {
            this.displayAccounts(programData.accounts);
        }

        if (programData.instructions) {
            this.displayInstructions(programData.instructions);
        }

        if (programData.types || programData.definedTypes) {
            const types = programData.types || programData.definedTypes;
            if (types) {
                this.displayTypes(types);
            }
        }

        if (programData.errors) {
            this.displayErrors(programData.errors);
        }

        if (programData.events) {
            this.displayEvents(programData.events);
        }
    }

    private displayAccounts(accounts: Account[]): void {
        const container = document.getElementById('accountsContent')!;
        accounts.forEach(account => {
            const item = document.createElement('div');
            item.className = 'item';

            let html = `<h3>${account.name}</h3>`;
            if (account.docs?.length) {
                html += `<div class="docs">${account.docs.join('<br>')}</div>`;
            }

            if (account.discriminator) {
                html += `<div class="discriminator">Discriminator: [${account.discriminator.join(', ')}]</div>`;
            }

            const fields = account.data?.fields || account.type?.fields;
            if (fields) {
                html += '<div class="fields">';
                fields.forEach(field => {
                    html += `
            <div class="field">
              <span class="field-name">${field.name}</span>: 
              <span class="field-type">${this.formatType(field.type)}</span>
              ${field.docs?.length ? `<div class="docs">${field.docs.join('<br>')}</div>` : ''}
            </div>
          `;
                });
                html += '</div>';
            }

            item.innerHTML = html;
            this.addCopyButton(item, account, 'account');
            container.appendChild(item);
        });
    }

    private displayInstructions(instructions: Instruction[]): void {
        const container = document.getElementById('instructionsContent')!;
        instructions.forEach(instruction => {
            const item = document.createElement('div');
            item.className = 'item';

            let html = `<h3>${instruction.name}</h3>`;
            if (instruction.docs?.length) {
                html += `<div class="docs">${instruction.docs.join('<br>')}</div>`;
            }

            if (instruction.discriminator) {
                html += `<div class="discriminator">Discriminator: [${instruction.discriminator.join(', ')}]</div>`;
            }

            if (instruction.accounts?.length) {
                html += '<h4>Accounts:</h4><div class="accounts">';
                instruction.accounts.forEach(account => {
                    const isWritable = account.isWritable || account.writable;
                    const isSigner = account.isSigner || account.signer;
                    const isOptional = account.isOptional || account.optional;

                    html += `
            <div class="field">
              <span class="field-name">${account.name}</span>
              ${isWritable ? '<span class="badge writable">writable</span>' : ''}
              ${isSigner ? '<span class="badge signer">signer</span>' : ''}
              ${isOptional ? '<span class="badge optional">optional</span>' : ''}
              ${account.docs?.length ? `<div class="docs">${account.docs.join('<br>')}</div>` : ''}
            </div>
          `;
                });
                html += '</div>';
            }

            const args = instruction.args || instruction.arguments;
            if (args?.length) {
                html += '<h4>Arguments:</h4><div class="arguments">';
                args.forEach(arg => {
                    html += `
            <div class="field">
              <span class="field-name">${arg.name}</span>: 
              <span class="field-type">${this.formatType(arg.type)}</span>
              ${arg.docs?.length ? `<div class="docs">${arg.docs.join('<br>')}</div>` : ''}
            </div>
          `;
                });
                html += '</div>';
            }

            item.innerHTML = html;
            this.addCopyButton(item, instruction, 'instruction');
            container.appendChild(item);
        });
    }

    private displayEvents(events: Event[]): void {
        const container = document.getElementById('eventsContent')!;
        events.forEach(event => {
            const item = document.createElement('div');
            item.className = 'item';

            let html = `<h3>${event.name}</h3>`;
            if (event.docs?.length) {
                html += `<div class="docs">${event.docs.join('<br>')}</div>`;
            }

            if (event.discriminator) {
                html += `<div class="discriminator">Discriminator: [${event.discriminator.join(', ')}]</div>`;
            }

            const fields = event.type?.fields || event.fields;
            if (fields) {
                html += '<div class="fields">';
                fields.forEach(field => {
                    html += `
            <div class="field">
              <span class="field-name">${field.name}</span>: 
              <span class="field-type">${this.formatType(field.type)}</span>
              ${field.docs?.length ? `<div class="docs">${field.docs.join('<br>')}</div>` : ''}
            </div>
          `;
                });
                html += '</div>';
            }

            item.innerHTML = html;
            this.addCopyButton(item, event, 'event');
            container.appendChild(item);
        });
    }

    private displayTypes(types: Type[]): void {
        const container = document.getElementById('typesContent')!;
        types.forEach(type => {
            const item = document.createElement('div');
            item.className = 'item';

            let html = `<h3>${type.name}</h3>`;
            if (type.docs?.length) {
                html += `<div class="docs">${type.docs.join('<br>')}</div>`;
            }

            const typeData = type.type;
            if (typeData && isTypeNodeObject(typeData)) {
                if (typeData.kind === 'enumTypeNode' || typeData.kind === 'enum') {
                    html += '<div class="enum-variants">';
                    typeData.variants?.forEach(variant => {
                        html += `<div class="field">${variant.name}</div>`;
                    });
                    html += '</div>';
                } else if (typeData.kind === 'struct' || typeData.kind === 'structTypeNode') {
                    html += '<div class="struct-fields">';
                    typeData.fields?.forEach(field => {
                        html += `
              <div class="field">
                <span class="field-name">${field.name}</span>: 
                <span class="field-type">${this.formatType(field.type)}</span>
                ${field.docs?.length ? `<div class="docs">${field.docs.join('<br>')}</div>` : ''}
              </div>
            `;
                    });
                    html += '</div>';
                }
            }

            item.innerHTML = html;
            container.appendChild(item);
        });
    }

    private displayErrors(errors: ErrorType[]): void {
        const container = document.getElementById('errorsContent')!;
        errors.forEach(error => {
            const item = document.createElement('div');
            item.className = 'item';

            let html = `<h3>${error.name} (Code: ${error.code})</h3>`;
            if (error.message || error.msg) {
                html += `<div class="error">${error.message || error.msg}</div>`;
            }
            if (error.docs?.length) {
                html += `<div class="docs">${error.docs.join('<br>')}</div>`;
            }

            item.innerHTML = html;
            container.appendChild(item);
        });
    }

    private formatType(type: TypeNode): string {
        if (!type) return '';

        if (typeof type === 'string') {
            return type;
        }

        if (!isTypeNodeObject(type)) {
            return String(type);
        }

        switch (type.kind) {
            case 'publicKeyTypeNode':
            case 'pubkey':
                return 'PublicKey';
            case 'numberTypeNode':
                return `${type.format}${type.endian ? ` (${type.endian})` : ''}`;
            case 'stringTypeNode':
                return `String (${type.encoding})`;
            case 'definedTypeLinkNode':
                return type.name || '';
            case 'sizePrefixTypeNode':
                return `SizePrefixed<${this.formatType(type.type || '')}>`;
            case 'array':
                return `Array<${this.formatType(type[0] || '')}, ${type[1] || ''}>`;
            default:
                return type.kind;
        }
    }

    private clearAllSections(): void {
        const sections = [
            'accountsContent',
            'instructionsContent',
            'typesContent',
            'errorsContent',
            'eventsContent',
        ];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.innerHTML = '';
            }
        });
    }

    private showError(message: string): void {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.body.insertBefore(errorDiv, this.idlContent);
    }
}

// Initialize the application when the DOM is loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new IDLViewer();
        });
    } else {
        new IDLViewer();
    }
} 