const fs = require('fs');
const path = require('path');

function loadCommands() {
    const commands = {};

    const commandsPath = path.join(__dirname, 'commands');

    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
        try {
            const command = require(path.join(commandsPath, file));
            if (!command.name) continue;
            commands[command.name] = command;
        } catch (e) {
            console.error(`❌ خطأ أثناء تحميل الأمر ${file}:`, e);
        }
    }

    return commands;
}

module.exports = { loadCommands };
`, e);
        }
    }

    return commands;
}

module.exports = { loadCommands };
