const { Command } = require('commander');
const fs = require('fs');

const program = new Command();

// Налаштування командного рядка
program
  .name('flights-analyzer')
  .description('Аналізатор даних польотів')
  .version('1.0.0')
  .requiredOption('-i, --input <path>', 'шлях до файлу для читання (обов\'язковий)')
  .option('-o, --output <path>', 'шлях до файлу для запису результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('--date', 'відображати дату перед інформацією про відстань та час у повітрі')
  .option('-a, --airtime <minutes>', 'відображати лише записи з часом у повітрі довшим за заданий (у хвилинах)', parseInt);

program.parse();

const options = program.opts();

// Перевірка обов'язкового параметра
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

try {
  // Читання JSONL файлу (кожен рядок - окремий JSON об'єкт)
  const fileContent = fs.readFileSync(options.input, 'utf8');
  const lines = fileContent.trim().split('\n');
  
  let results = [];
  
  // Обробка кожного запису
  lines.forEach(line => {
    if (!line.trim()) return; // Пропускаємо порожні рядки
    
    const flight = JSON.parse(line);
    // Фільтрація за часом у повітрі, якщо параметр задано
    if (options.airtime && flight.AIR_TIME <= options.airtime) {
      return; // Пропускаємо цей запис
    }
    
    let outputLine = '';
    
    // Додавання дати, якщо параметр --date задано
    if (options.date && flight.FL_DATE) {
      outputLine += flight.FL_DATE + ' ';
    }
    
    // Додавання часу у повітрі та відстані
    const airTime = flight.AIR_TIME || 'N/A';
    const distance = flight.DISTANCE || 'N/A';
    outputLine += airTime + ' ' + distance;
    
    results.push(outputLine);
  });
  
  const output = results.join('\n');
  
  // Вивід результатів
  if (options.display) {
    console.log(output);
  }
  
  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf8');
  }
  
  // Якщо ні -o, ні -d не задано, нічого не виводимо
  
} catch (error) {
  console.error('Помилка при обробці файлу:', error.message);
  process.exit(1);
}
