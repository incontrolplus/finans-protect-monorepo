import{n as e,s as t,t as n}from"./jsx-dev-runtime-Bzm0_3ol.js";import{B as r,F as i,H as a,U as o,Y as s,at as c,m as l,ot as u,q as d}from"./index-DJ083onh.js";var f=c(`Languages`,[[`path`,{d:`m5 8 6 6`,key:`1wu5hv`}],[`path`,{d:`m4 14 6-6 2-3`,key:`1k1g8d`}],[`path`,{d:`M2 5h12`,key:`or177f`}],[`path`,{d:`M7 2h1`,key:`1t2jsx`}],[`path`,{d:`m22 22-5-10-5 10`,key:`don7ne`}],[`path`,{d:`M14 18h6`,key:`1m8k6r`}]]),p=t(e(),1),m=n(),h=`/Users/diokarabaz/Wallestars/src/pages/PromptGenerator.jsx`;function g(){let[e,t]=(0,p.useState)(!1),[n,c]=(0,p.useState)(!1),[g,_]=(0,p.useState)(`en`),v=`# Prompt for Anthropic Console: Spark Visual App Generator

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
- Including concrete examples and code snippets`,y=`# Prompt Generator за Spark Visual App

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

Anthropic Prompt Generator ще създаде детайлен промпт който може директно да се използва за създаване на Spark приложение с всички посочени функционалности.`,b=async(e,n=!1)=>{try{await navigator.clipboard.writeText(e),n?(c(!0),setTimeout(()=>c(!1),2e3)):(t(!0),setTimeout(()=>t(!1),2e3))}catch(e){console.error(`Failed to copy:`,e)}},x=(e,t)=>{let n=new Blob([e],{type:`text/markdown`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)};return(0,m.jsxDEV)(`div`,{className:`space-y-6`,children:[(0,m.jsxDEV)(u.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},className:`glass-effect rounded-2xl p-6 border border-white/10`,children:[(0,m.jsxDEV)(`div`,{className:`flex items-center gap-4 mb-4`,children:[(0,m.jsxDEV)(`div`,{className:`w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center`,children:(0,m.jsxDEV)(l,{className:`w-8 h-8 text-white`},void 0,!1,{fileName:h,lineNumber:400,columnNumber:13},this)},void 0,!1,{fileName:h,lineNumber:399,columnNumber:11},this),(0,m.jsxDEV)(`div`,{children:[(0,m.jsxDEV)(`h1`,{className:`text-3xl font-bold text-white`,children:`Prompt Generator`},void 0,!1,{fileName:h,lineNumber:403,columnNumber:13},this),(0,m.jsxDEV)(`p`,{className:`text-dark-300`,children:`Generate prompts for Spark Visual App creation`},void 0,!1,{fileName:h,lineNumber:404,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:402,columnNumber:11},this)]},void 0,!0,{fileName:h,lineNumber:398,columnNumber:9},this),(0,m.jsxDEV)(`div`,{className:`glass-effect bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mt-4`,children:(0,m.jsxDEV)(`div`,{className:`flex items-start gap-3`,children:[(0,m.jsxDEV)(i,{className:`w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5`},void 0,!1,{fileName:h,lineNumber:411,columnNumber:13},this),(0,m.jsxDEV)(`div`,{className:`text-sm text-dark-200`,children:[(0,m.jsxDEV)(`p`,{className:`font-medium text-white mb-2`,children:`How to use this tool:`},void 0,!1,{fileName:h,lineNumber:413,columnNumber:15},this),(0,m.jsxDEV)(`ol`,{className:`list-decimal list-inside space-y-1`,children:[(0,m.jsxDEV)(`li`,{children:`Choose your preferred language (English or Bulgarian)`},void 0,!1,{fileName:h,lineNumber:415,columnNumber:17},this),(0,m.jsxDEV)(`li`,{children:`Copy the prompt using the "Copy to Clipboard" button`},void 0,!1,{fileName:h,lineNumber:416,columnNumber:17},this),(0,m.jsxDEV)(`li`,{children:[`Go to `,(0,m.jsxDEV)(`a`,{href:`https://console.anthropic.com/workbench/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-primary-400 hover:text-primary-300 underline`,children:`Anthropic Console Workbench`},void 0,!1,{fileName:h,lineNumber:417,columnNumber:27},this)]},void 0,!0,{fileName:h,lineNumber:417,columnNumber:17},this),(0,m.jsxDEV)(`li`,{children:`Paste the prompt in the Prompt Generator`},void 0,!1,{fileName:h,lineNumber:418,columnNumber:17},this),(0,m.jsxDEV)(`li`,{children:`Review and refine the generated prompt`},void 0,!1,{fileName:h,lineNumber:419,columnNumber:17},this),(0,m.jsxDEV)(`li`,{children:`Use the final prompt to create your Spark application`},void 0,!1,{fileName:h,lineNumber:420,columnNumber:17},this)]},void 0,!0,{fileName:h,lineNumber:414,columnNumber:15},this)]},void 0,!0,{fileName:h,lineNumber:412,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:410,columnNumber:11},this)},void 0,!1,{fileName:h,lineNumber:409,columnNumber:9},this)]},void 0,!0,{fileName:h,lineNumber:393,columnNumber:7},this),(0,m.jsxDEV)(u.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1},className:`glass-effect rounded-2xl p-6 border border-white/10`,children:(0,m.jsxDEV)(`div`,{className:`flex items-center justify-between mb-4`,children:[(0,m.jsxDEV)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsxDEV)(f,{className:`w-5 h-5 text-primary-400`},void 0,!1,{fileName:h,lineNumber:436,columnNumber:13},this),(0,m.jsxDEV)(`h2`,{className:`text-xl font-semibold text-white`,children:`Language / Език`},void 0,!1,{fileName:h,lineNumber:437,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:435,columnNumber:11},this),(0,m.jsxDEV)(`div`,{className:`flex gap-2`,children:[(0,m.jsxDEV)(`button`,{onClick:()=>_(`en`),className:`px-4 py-2 rounded-lg font-medium transition-all ${g===`en`?`bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30`:`bg-white/5 text-dark-300 hover:text-white hover:bg-white/10`}`,children:`English`},void 0,!1,{fileName:h,lineNumber:440,columnNumber:13},this),(0,m.jsxDEV)(`button`,{onClick:()=>_(`bg`),className:`px-4 py-2 rounded-lg font-medium transition-all ${g===`bg`?`bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30`:`bg-white/5 text-dark-300 hover:text-white hover:bg-white/10`}`,children:`Български`},void 0,!1,{fileName:h,lineNumber:450,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:439,columnNumber:11},this)]},void 0,!0,{fileName:h,lineNumber:434,columnNumber:9},this)},void 0,!1,{fileName:h,lineNumber:428,columnNumber:7},this),(0,m.jsxDEV)(u.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.2},className:`glass-effect rounded-2xl p-6 border border-white/10`,children:[(0,m.jsxDEV)(`div`,{className:`flex items-center justify-between mb-4`,children:[(0,m.jsxDEV)(`h2`,{className:`text-xl font-semibold text-white`,children:g===`en`?`Generated Prompt`:`Генериран Промпт`},void 0,!1,{fileName:h,lineNumber:472,columnNumber:11},this),(0,m.jsxDEV)(`div`,{className:`flex gap-2`,children:[(0,m.jsxDEV)(u.button,{whileHover:{scale:1.05},whileTap:{scale:.95},onClick:()=>x(g===`en`?v:y,g===`en`?`spark-app-prompt-en.md`:`spark-app-prompt-bg.md`),className:`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10`,children:[(0,m.jsxDEV)(o,{className:`w-4 h-4`},void 0,!1,{fileName:h,lineNumber:485,columnNumber:15},this),(0,m.jsxDEV)(`span`,{className:`text-sm font-medium`,children:g===`en`?`Download`:`Изтегли`},void 0,!1,{fileName:h,lineNumber:486,columnNumber:15},this)]},void 0,!0,{fileName:h,lineNumber:476,columnNumber:13},this),(0,m.jsxDEV)(u.button,{whileHover:{scale:1.05},whileTap:{scale:.95},onClick:()=>b(g===`en`?v:y,g===`bg`),className:`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${(g===`bg`?n:e)?`bg-green-500 text-white`:`bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30`}`,children:(g===`bg`?n:e)?(0,m.jsxDEV)(m.Fragment,{children:[(0,m.jsxDEV)(s,{className:`w-4 h-4`},void 0,!1,{fileName:h,lineNumber:505,columnNumber:19},this),(0,m.jsxDEV)(`span`,{className:`text-sm font-medium`,children:g===`en`?`Copied!`:`Копирано!`},void 0,!1,{fileName:h,lineNumber:506,columnNumber:19},this)]},void 0,!0,{fileName:h,lineNumber:504,columnNumber:17},this):(0,m.jsxDEV)(m.Fragment,{children:[(0,m.jsxDEV)(d,{className:`w-4 h-4`},void 0,!1,{fileName:h,lineNumber:512,columnNumber:19},this),(0,m.jsxDEV)(`span`,{className:`text-sm font-medium`,children:g===`en`?`Copy to Clipboard`:`Копирай`},void 0,!1,{fileName:h,lineNumber:513,columnNumber:19},this)]},void 0,!0,{fileName:h,lineNumber:511,columnNumber:17},this)},void 0,!1,{fileName:h,lineNumber:490,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:475,columnNumber:11},this)]},void 0,!0,{fileName:h,lineNumber:471,columnNumber:9},this),(0,m.jsxDEV)(`div`,{className:`bg-dark-900/50 rounded-lg p-4 border border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar`,children:(0,m.jsxDEV)(`pre`,{className:`text-sm text-dark-200 whitespace-pre-wrap font-mono leading-relaxed`,children:g===`en`?v:y},void 0,!1,{fileName:h,lineNumber:524,columnNumber:11},this)},void 0,!1,{fileName:h,lineNumber:523,columnNumber:9},this)]},void 0,!0,{fileName:h,lineNumber:465,columnNumber:7},this),(0,m.jsxDEV)(u.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.3},className:`glass-effect rounded-2xl p-6 border border-white/10`,children:[(0,m.jsxDEV)(`h2`,{className:`text-xl font-semibold text-white mb-4`,children:g===`en`?`Quick Links`:`Бързи Връзки`},void 0,!1,{fileName:h,lineNumber:537,columnNumber:9},this),(0,m.jsxDEV)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 gap-4`,children:[(0,m.jsxDEV)(`a`,{href:`https://console.anthropic.com/workbench/`,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 group`,children:[(0,m.jsxDEV)(`div`,{className:`w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center`,children:(0,m.jsxDEV)(a,{className:`w-5 h-5 text-white`},void 0,!1,{fileName:h,lineNumber:548,columnNumber:15},this)},void 0,!1,{fileName:h,lineNumber:547,columnNumber:13},this),(0,m.jsxDEV)(`div`,{className:`flex-1`,children:[(0,m.jsxDEV)(`h3`,{className:`font-medium text-white group-hover:text-primary-400 transition-colors`,children:g===`en`?`Anthropic Console`:`Anthropic Конзола`},void 0,!1,{fileName:h,lineNumber:551,columnNumber:15},this),(0,m.jsxDEV)(`p`,{className:`text-sm text-dark-400`,children:g===`en`?`Open Workbench`:`Отвори Workbench`},void 0,!1,{fileName:h,lineNumber:554,columnNumber:15},this)]},void 0,!0,{fileName:h,lineNumber:550,columnNumber:13},this),(0,m.jsxDEV)(a,{className:`w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors`},void 0,!1,{fileName:h,lineNumber:558,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:541,columnNumber:11},this),(0,m.jsxDEV)(`a`,{href:`https://docs.anthropic.com/claude/docs`,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 group`,children:[(0,m.jsxDEV)(`div`,{className:`w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center`,children:(0,m.jsxDEV)(r,{className:`w-5 h-5 text-white`},void 0,!1,{fileName:h,lineNumber:568,columnNumber:15},this)},void 0,!1,{fileName:h,lineNumber:567,columnNumber:13},this),(0,m.jsxDEV)(`div`,{className:`flex-1`,children:[(0,m.jsxDEV)(`h3`,{className:`font-medium text-white group-hover:text-primary-400 transition-colors`,children:g===`en`?`Claude Documentation`:`Claude Документация`},void 0,!1,{fileName:h,lineNumber:571,columnNumber:15},this),(0,m.jsxDEV)(`p`,{className:`text-sm text-dark-400`,children:g===`en`?`Learn more about prompts`:`Научи повече за промптове`},void 0,!1,{fileName:h,lineNumber:574,columnNumber:15},this)]},void 0,!0,{fileName:h,lineNumber:570,columnNumber:13},this),(0,m.jsxDEV)(a,{className:`w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors`},void 0,!1,{fileName:h,lineNumber:578,columnNumber:13},this)]},void 0,!0,{fileName:h,lineNumber:561,columnNumber:11},this)]},void 0,!0,{fileName:h,lineNumber:540,columnNumber:9},this)]},void 0,!0,{fileName:h,lineNumber:531,columnNumber:7},this)]},void 0,!0,{fileName:h,lineNumber:391,columnNumber:5},this)}export{g as default};
//# sourceMappingURL=PromptGenerator-BWovX4T_.js.map