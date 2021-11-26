#!/usr/bin/env node

'use strict'

const readline = require('readline')
const chalk = require('chalk')
const { Select } = require('enquirer')

const piText = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
const piStartText = '3.'
const belowDecimalPointText = piText.substring(piStartText.length)
const sectionDigitsNum = 10

function prepareProcessStdinForInput () {
  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.resume()
}

function quitGame () {
  console.log(chalk.bold.green('\nThank you for playing, my friend!'))
  process.exit()
}

class TypingMode {
  constructor () {
    this.outOfRange = -1
  }

  async start ({ isRealMode }) {
    const startIndex = isRealMode ? 0 : await this.getStartIndex()
    if (startIndex === this.outOfRange) {
      await this.start({ isRealMode: false })
      return
    }
    const instruction = 'Start typing pi.'
    console.clear()
    process.stdout.write(chalk.bold.green(instruction) + '\n\n' + piStartText + belowDecimalPointText.slice(0, startIndex))
    await this.startTypingSession(startIndex, isRealMode)
  }

  async getStartIndex () {
    const prompt = await this.getStartingPointPrompt().catch(() => { quitGame() })
    const answer = await prompt.run().catch(() => { quitGame() })
    if (answer < 1 || answer > belowDecimalPointText.length) {
      console.log(chalk.bold.red('Your input is out of range.'))
      return this.outOfRange
    }
    return answer - 1
  }

  async getStartingPointPrompt () {
    const { NumberPrompt } = require('enquirer')
    return new NumberPrompt({
      name: 'number',
      message: 'Set your designated point(1-100): '
    })
  }

  async startTypingSession (startIndex, isRealMode) {
    return new Promise((resolve, reject) => {
      prepareProcessStdinForInput()
      const piLastNumber = belowDecimalPointText.slice(-1)
      const piLastIndex = belowDecimalPointText.length - 1
      let currentIndex = startIndex
      process.stdin.on('keypress', (char, key) => {
        if (key.ctrl && key.name === 'c') {
          quitGame()
        } else if (currentIndex === piLastIndex && char === piLastNumber) {
          console.log(piLastNumber)
          if (isRealMode) {
            this.putCongratulations()
          }
          this.breakLoop(resolve)
        } else if (char === belowDecimalPointText[currentIndex]) {
          process.stdout.write(char)
          currentIndex++
        } else {
          const endingIndexMessage =
            this.makeEndingIndexMessage({ endingIndex: currentIndex, isRealMode: isRealMode })
          const remainingDigitsText = this.make_remaining_digits_text(currentIndex)
          console.log(chalk.red(remainingDigitsText) + '\n\n' + endingIndexMessage)
          this.breakLoop(resolve)
        }
      })
    })
  }

  putCongratulations () {
    const message = this.buildCongratulationsMessage()
    console.log(chalk.bold.green(message))
  }

  buildCongratulationsMessage () {
    const headSpaces = ' '.repeat(6)
    const sentences = [
      'Congratulations!',
      `You have memorized the first ${belowDecimalPointText.length} digits of pi.`
    ]
    return sentences.map(sentence => {
      return headSpaces + sentence + '\n'
    }).join('')
  }

  makeEndingIndexMessage ({ endingIndex, isRealMode }) {
    const resultType = isRealMode ? 'score' : 'ending point'
    const resultNum = isRealMode ? endingIndex : (endingIndex + 1)
    return `Your ${resultType}: ${chalk.bold.green(resultNum)}`
  }

  breakLoop (resolve) {
    process.stdin.removeAllListeners('keypress')
    process.stdin.pause()
    resolve()
  }

  make_remaining_digits_text (currentIndex) {
    let remaining_digits_text = ''
    const lineDigitsNum = 50
    for (let i = currentIndex; i < belowDecimalPointText.length; i++) {
      if (i === lineDigitsNum) {
        remaining_digits_text += '\n' + ' '.repeat(piStartText.length)
      } else if (i !== 0 && i % sectionDigitsNum === 0) {
        remaining_digits_text += ' '
      }
      remaining_digits_text += belowDecimalPointText[i]
    }
    return remaining_digits_text
  }
}

class ShowPiMode {
  async start () {
    this.putPiText()
  }

  putPiText () {
    const pi_text = this.buildSeparatedPiText()
    console.log(pi_text)
  }

  buildSeparatedPiText () {
    const piTextSections = []
    for (let i = 0; i < belowDecimalPointText.length; i += sectionDigitsNum) {
      piTextSections.push(belowDecimalPointText.substring(i, i + sectionDigitsNum))
    }
    const sectionsNumPerLine = 5
    const piTextBlocks = []
    for (let i = 0; i < piTextSections.length; i += sectionsNumPerLine) {
      piTextBlocks.push(piTextSections.slice(i, i + sectionsNumPerLine).join(' '))
    }
    return piStartText + piTextBlocks.join('\n  ')
  }
}

class Game {
  constructor () {
    this.practiceModeText = 'PRACTICE MODE'
    this.realModeText = 'REAL MODE'
    this.showPiDigitsModeText = 'SHOW PI DIGITS'
    this.quittingText = 'QUIT'
  }

  async start () {
    this.putWelcomeMessage()
    const selectedModeName = await this.getSelectedModeName()
    await this.playMode(selectedModeName).catch(() => quitGame())
    this.leadToNextGame()
  }

  putWelcomeMessage () {
    console.clear()
    const welcomeMessage = this.buildWelcomeMessage()
    console.log(chalk.bold.green(welcomeMessage) + '\n')
  }

  buildWelcomeMessage () {
    const repeatingTimes = 10
    return '>'.repeat(repeatingTimes) + ' PI GAME ' + '<'.repeat(repeatingTimes)
  }

  async getSelectedModeName () {
    const prompt = await this.buildPrompt().catch(() => quitGame())
    const selectedModeName = await prompt.run().catch(() => quitGame())
    return selectedModeName
  }

  async buildPrompt () {
    const modes = [
      {
        name: this.practiceModeText,
        explanation: 'Check how many digits of pi you can name from a point you designate.'
      },
      {
        name: this.realModeText,
        explanation: 'Check how many digits of pi you can name.'
      },
      {
        name: this.showPiDigitsModeText,
        explanation: 'Check the first 100 digits of pi.'
      },
      {
        name: this.quittingText,
        explanation: 'Quit the game.'
      }
    ]
    return new Select({
      name: 'mode',
      message: 'Select your mode:',
      choices: modes.map(mode => mode.name),
      footer () {
        const explanations = modes.map(mode => ' '.repeat(2) + mode.explanation)
        return chalk.green('\n' + explanations[this.index])
      }
    })
  }

  async playMode (modeName) {
    switch (modeName) {
      case this.practiceModeText:
        return new TypingMode().start({ isRealMode: false })
      case this.realModeText:
        return new TypingMode().start({ isRealMode: true })
      case this.showPiDigitsModeText:
        return new ShowPiMode().start()
      case this.quittingText:
        quitGame()
    }
  }

  leadToNextGame () {
    prepareProcessStdinForInput()
    console.log('\nPress any key to return to mode selection.')
    process.stdin.once('data', () => {
      console.clear()
      new Game().start().catch(() => quitGame())
    })
  }
}

new Game().start().catch(() => quitGame())
