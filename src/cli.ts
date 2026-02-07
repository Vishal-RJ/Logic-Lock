import { Command } from 'commander';
import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

program
    .name('logiclock')
    .description('LogicLock CLI for educational modules')
    .version('0.1.0');

program
    .command('fetch')
    .description('Fetch a training module from a remote repository')
    .argument('<module_id>', 'The ID of the module to fetch')
    .action(async (moduleId: string) => {
        try {
            console.log(`🚀 Fetching module: ${moduleId}...`);

            // Example base URL for modules - change this to your actual repository or Gist
            const BASE_URL = 'https://raw.githubusercontent.com/example/logiclock-modules/main';
            const moduleUrl = `${BASE_URL}/${moduleId}/exercise.json`;

            const response = await axios.get(moduleUrl);
            const moduleData = response.data;

            const targetDir = path.join(process.cwd(), moduleId);
            await fs.ensureDir(targetDir);

            // Save exercise files
            for (const file of moduleData.files) {
                const filePath = path.join(targetDir, file.name);
                await fs.writeFile(filePath, file.content);
                console.log(`✅ Created: ${file.name}`);
            }

            // Save metadata.json
            await fs.writeJson(path.join(targetDir, 'metadata.json'), moduleData.metadata, { spaces: 2 });

            console.log(`\n🎉 Module "${moduleData.metadata.LearningGoal}" ready at: ${targetDir}`);
        } catch (error: any) {
            console.error(`❌ Error fetching module: ${error.message}`);
        }
    });

program.parse();
