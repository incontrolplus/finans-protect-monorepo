import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Download,
  Languages,
  Info
} from 'lucide-react';

export default function PromptGenerator() {
  const [copied, setCopied] = useState(false);
  const [copiedBg, setCopiedBg] = useState(false);
  const [language, setLanguage] = useState('en');

  const promptContentEn = `# Prompt for Anthropic Console: Spark Visual App Generator

## Meta-Prompt Description

You are tasked with creating a comprehensive prompt that will generate a **Spark Visual Application** for processing and visualizing information from various sources.

---

## Target Prompt to Generate

Create a prompt that instructs an AI to build a Spark application with the following capabilities:

### Core Functionality

**Input Processing:**
- Accept various types of links as input:
  - AI chat conversation links (Claude, ChatGPT, etc.)
  - Markdown (.md) file URLs or paths
  - Agent session links
  - Documentation URLs
  - GitHub issues/PRs
  - Any other relevant resource URLs

**Information Extraction & Analysis:**
- Parse and extract key information from provided links
- Identify main topics, concepts, and decision points
- Recognize patterns and relationships between different pieces of information
- Extract actionable items, questions, and options
- Summarize content in a structured format

**Visual Presentation:**
Create a beautiful, interactive Spark application interface with:
- **Cards** for content sections
- **Charts/graphs** for data visualization
- **Timeline views** for sequential information
- **Mind maps** for relationship visualization
- **Progress indicators** for multi-step processes
- **Modern design** with good contrast and readability
- **Icons** to supplement text

**Interactive Decision Making:**
- Generate contextual buttons and options based on extracted information
- Create multiple-choice questions for user decision points
- Provide clear, actionable choices at each step
- Allow users to select from generated options
- Support both single and multiple selection inputs
- Include text input fields where free-form responses are needed
- Real-time input validation
- Allow users to go back and change answers

**Response Recording:**
- Capture all user interactions and selections
- Build a comprehensive decision tree/script as users respond
- Record timestamps for each interaction
- Maintain context across all decisions
- Store metadata about each choice (why it was presented, what it relates to)

**Export Capabilities:**
Support exporting the complete session in multiple formats:

1. **JSON** - Structured data format with full context
2. **Markdown** - Human-readable report with sections and formatting
3. **YAML** - Configuration-friendly format
4. **PDF** - Print-ready document with visual elements
5. **HTML** - Standalone web page with embedded styles
6. **Script Format** - Code-like format that can be replayed or analyzed

Each export must include:
- Unique session identifier
- Timestamp
- All input sources
- Extracted information
- All decisions made with context
- Recommended next steps

**QR Code Generation:**
After session completion and export formatting:
- Generate a unique identifier for the session
- Create a QR code that links to the session results
- Store results in an accessible location (cloud storage, database, or local file)
- QR code should encode a URL to view/download the complete analysis
- Include session metadata in the QR code destination
- Provide download of QR code as PNG/SVG image

**Dynamic State Management:**
- Track completion status of each section
- Mark required vs. optional fields
- Show visual indicators when all necessary options are selected
- Enable/disable navigation based on completion state
- Provide progress percentage or step counter
- Allow users to review and modify previous answers

### User Flow

1. **Start Screen**
   - User enters one or multiple links
   - App validates and shows detected link types
   - User clicks "Analyze" to begin

2. **Analysis Phase**
   - Loading indicator
   - Fetches and processes content from all links
   - Extracts key information and decision points
   - Displays visual summary of findings

3. **Interactive Decision Phase**
   - App presents first decision point with context
   - Shows relevant options as interactive buttons
   - User makes selection
   - App records choice and moves to next decision
   - Repeat until all decisions are made

4. **Review Phase**
   - Show summary of all decisions made
   - Allow editing of any previous choice
   - Display completeness indicator

5. **Export & QR Generation**
   - User selects desired export formats
   - App generates files in selected formats
   - Creates QR code linking to results
   - Provides download buttons and QR code image

### Technical Requirements
- Use modern web technologies
- Provide error handling for invalid/broken links
- Loading states during processing
- Responsive design for all screen sizes
- Accessibility compliance
- Cache processed data

### Success Criteria
The generated Spark application should:
- ✅ Successfully parse and extract information from various link types
- ✅ Present information in a clear, visual format
- ✅ Generate contextual, relevant options for user interaction
- ✅ Record all user decisions with full context
- ✅ Export to at least 3 different formats
- ✅ Generate a working QR code that links to results
- ✅ Track completion state dynamically
- ✅ Provide an excellent user experience
- ✅ Be fully functional as a standalone Spark app

### Optional Enhancements
- AI analysis for suggesting best options
- Collaboration - multiple users contributing
- Version history
- Reusable templates
- Decision pattern analytics
- Integration with external tools (Notion, Slack)
- Offline mode
- Dark mode

### Final Prompt Structure
The prompt you generate should include:
1. System context (AI's role)
2. Task description
3. Input specifications
4. Processing logic
5. UI/UX requirements
6. Output specifications
7. Examples
8. Constraints
9. Success criteria

### Important Notes
- Focus on practicality and user-friendly interface
- Prioritize core functionalities
- Provide clear, detailed instructions
- Include concrete examples
- Consider edge cases

---

## How to Use This Prompt

1. Copy the entire text from "Target Prompt to Generate" section above
2. Go to https://console.anthropic.com/workbench/
3. Create a new prompt generation task
4. Paste this content in the prompt generator
5. Review and refine the generated prompt
6. Use the final prompt to create your Spark application

---

## Expected Result

The Anthropic Prompt Generator will create a detailed, high-quality prompt that can be directly used to create a Spark application with all specified functionalities. The generated prompt will be:
- Clear and unambiguous
- Detailed and comprehensive
- Easy to execute
- Optimized for the Spark platform
- Including concrete examples and code snippets`;

  const promptContentBg = `# Prompt Generator за Spark Visual App

## ПРОМПТ ЗА ГЕНЕРИРАНЕ

Моля, създай детайлен промпт за изграждане на Spark визуално приложение със следните функционалности:

### ОСНОВНА ЦЕЛ
Създай интерактивно Spark приложение, което приема различни типове линкове (AI чатове, markdown файлове, agent sessions, GitHub issues и др.), извлича информация от тях, визуализира я по красив начин и води потребителя през интерактивен процес на вземане на решения с възможност за експорт в множество формати и генериране на QR код за достъп до резултатите.

### ВХОДНИ ДАННИ
Приложението трябва да приема:
- Линкове към AI чат конверсации (Claude, ChatGPT и др.)
- Markdown (.md) файлове (URLs или локални пътища)
- Agent session идентификатори
- GitHub issues/PRs
- Документация URLs
- Всякакви други релевантни ресурси

### ИЗВЛИЧАНЕ И АНАЛИЗ НА ИНФОРМАЦИЯ
- Парсване на съдържанието от всички предоставени линкове
- Идентифициране на ключови теми, концепции и точки за решение
- Разпознаване на връзки между различни части от информацията
- Извличане на действащи елементи, въпроси и опции
- Структуриране на информацията в ясен формат

### ВИЗУАЛНА ПРЕЗЕНТАЦИЯ
Създай красив, интерактивен интерфейс с:
- **Карти** за различни секции на съдържанието
- **Графики и диаграми** за визуализация на данни
- **Timeline изгледи** за последователна информация
- **Mind maps** за визуализация на връзки
- **Progress индикатори** за многостъпкови процеси
- **Модерен дизайн** с добър контраст и четимост
- **Икони** за допълване на текста

### ИНТЕРАКТИВНО ВЗЕМАНЕ НА РЕШЕНИЯ
- Генериране на контекстуални бутони и опции базирани на извлечената информация
- Създаване на въпроси с множествен избор за точки на решение
- Ясни, действащи избори на всяка стъпка
- Възможност за избор (single/multiple selection)
- Текстови полета за свободен отговор където е необходимо
- Валидация на входните данни в реално време
- Възможност за връщане назад и промяна на отговорите

### ЗАПИСВАНЕ НА ОТГОВОРИТЕ
- Записване на всички взаимодействия и избори на потребителя
- Изграждане на дърво на решения/скрипт докато потребителят отговаря
- Запазване на timestamps за всяко взаимодействие
- Поддържане на контекста през всички решения
- Съхранение на метаданни за всеки избор

### ЕКСПОРТ ФУНКЦИОНАЛНОСТИ
Приложението трябва да поддържа експорт в следните формати:

1. **JSON** - Структурирани данни с пълен контекст
2. **Markdown** - Четим за хора доклад с форматиране
3. **YAML** - Формат подходящ за конфигурации
4. **PDF** - Готов за печат документ с визуални елементи
5. **HTML** - Самостоятелна уеб страница с embedded стилове
6. **Script Format** - Формат подобен на код който може да бъде replay-нат

Всеки експорт трябва да съдържа:
- Уникален идентификатор на сесията
- Timestamp
- Всички входни източници
- Извлечена информация
- Всички взети решения с контекст
- Следващи препоръчани стъпки

### QR CODE ГЕНЕРИРАНЕ
След завършване и форматиране на експорта:
- Генерирай уникален идентификатор за сесията
- Създай QR код който води към резултатите
- Съхрани резултатите на достъпно място
- QR кодът да кодира URL за преглед/download на пълния анализ
- Включи метаданни на сесията
- Осигури download на QR кода като PNG/SVG изображение

### ДИНАМИЧНО УПРАВЛЕНИЕ НА СЪСТОЯНИЕТО
- Проследяване на статуса на завършване на всяка секция
- Маркиране на задължителни vs. опционални полета
- Визуални индикатори когато всички необходими опции са избрани
- Enable/disable навигация базирана на статус на завършеност
- Progress процент или брояч на стъпките
- Преглед на всички предишни отговори с възможност за промяна

### ПОТРЕБИТЕЛСКИ ПОТОК
1. **Начален екран** - Въвеждане на линкове и валидация
2. **Фаза на анализ** - Loading и обработка на съдържанието
3. **Интерактивна фаза на решения** - Представяне на опции и запис на избори
4. **Фаза на преглед** - Резюме на всички взети решения
5. **Експорт и QR генериране** - Избор на формати и генериране на QR код

### ТЕХНИЧЕСКИ ИЗИСКВАНИЯ
- Използвай съвременни web технологии
- Осигури error handling за невалидни/счупени линкове
- Loading states по време на обработка
- Responsive дизайн за всички размери екрани
- Accessibility съвместимост
- Кеширане на обработени данни

### КРИТЕРИИ ЗА УСПЕХ
Генерираното Spark приложение трябва да:
- ✅ Успешно парсва и извлича информация от различни типове линкове
- ✅ Представя информацията по ясен, визуален начин
- ✅ Генерира контекстуални, релевантни опции
- ✅ Записва всички решения на потребителя с пълен контекст
- ✅ Експортира в минимум 3 различни формата
- ✅ Генерира работещ QR код
- ✅ Проследява състоянието на завършеност динамично
- ✅ Осигурява отлично потребителско изживяване

### ДОПЪЛНИТЕЛНИ ХАРАКТЕРИСТИКИ (опционални)
- AI анализ за предложение на най-добри опции
- Collaboration - множество потребители да допринасят
- История на версиите
- Шаблони за повторна употреба
- Analytics за decision patterns
- Интеграции с външни инструменти
- Offline режим
- Dark mode

### СТРУКТУРА НА КРАЙНИЯ ПРОМПТ
Промптът който генерираш трябва да съдържа:
1. Контекст на системата (роля на AI)
2. Описание на задачата
3. Спецификации на входните данни
4. Логика за обработка
5. UI/UX изисквания
6. Спецификации на изходните данни
7. Примери
8. Конкретни изисквания
9. Критерии за успех

---

## КАК ДА ИЗПОЛЗВАШ

1. Копирай целия промпт по-горе
2. Отиди на https://console.anthropic.com/workbench/
3. Постави текста в prompt generator-а
4. Преглеждай и рафинирай генерирания промпт
5. Използвай финалния промпт за създаване на Spark приложение

---

## ОЧАКВАН РЕЗУЛТАТ

Anthropic Prompt Generator ще създаде детайлен промпт който може директно да се използва за създаване на Spark приложение с всички посочени функционалности.`;

  const handleCopy = async (content, isBg = false) => {
    try {
      await navigator.clipboard.writeText(content);
      if (isBg) {
        setCopiedBg(true);
        setTimeout(() => setCopiedBg(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Prompt Generator</h1>
            <p className="text-dark-300">Generate prompts for Spark Visual App creation</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-effect bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-dark-200">
              <p className="font-medium text-white mb-2">How to use this tool:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Choose your preferred language (English or Bulgarian)</li>
                <li>Copy the prompt using the "Copy to Clipboard" button</li>
                <li>Go to <a href="https://console.anthropic.com/workbench/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">Anthropic Console Workbench</a></li>
                <li>Paste the prompt in the Prompt Generator</li>
                <li>Review and refine the generated prompt</li>
                <li>Use the final prompt to create your Spark application</li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Language Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">Language / Език</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/5 text-dark-300 hover:text-white hover:bg-white/10'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('bg')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                language === 'bg'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/5 text-dark-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Български
            </button>
          </div>
        </div>
      </motion.div>

      {/* Prompt Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {language === 'en' ? 'Generated Prompt' : 'Генериран Промпт'}
          </h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDownload(
                language === 'en' ? promptContentEn : promptContentBg,
                language === 'en' ? 'spark-app-prompt-en.md' : 'spark-app-prompt-bg.md'
              )}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Download' : 'Изтегли'}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(
                language === 'en' ? promptContentEn : promptContentBg,
                language === 'bg'
              )}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                (language === 'bg' ? copiedBg : copied)
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
              }`}
            >
              {(language === 'bg' ? copiedBg : copied) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'Copied!' : 'Копирано!'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'Copy to Clipboard' : 'Копирай'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="bg-dark-900/50 rounded-lg p-4 border border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          <pre className="text-sm text-dark-200 whitespace-pre-wrap font-mono leading-relaxed">
            {language === 'en' ? promptContentEn : promptContentBg}
          </pre>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          {language === 'en' ? 'Quick Links' : 'Бързи Връзки'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://console.anthropic.com/workbench/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                {language === 'en' ? 'Anthropic Console' : 'Anthropic Конзола'}
              </h3>
              <p className="text-sm text-dark-400">
                {language === 'en' ? 'Open Workbench' : 'Отвори Workbench'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
          </a>

          <a
            href="https://docs.anthropic.com/claude/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                {language === 'en' ? 'Claude Documentation' : 'Claude Документация'}
              </h3>
              <p className="text-sm text-dark-400">
                {language === 'en' ? 'Learn more about prompts' : 'Научи повече за промптове'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
