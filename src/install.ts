import os from 'os'
import path from 'path'
import fs from 'fs'
import https from 'https'
import extract from 'extract-zip'
import { WIDEVINE_VERSION } from './constants'

const arch = os.arch()
const platform = os.platform()

if (platform !== 'darwin' && platform !== 'win32' && platform !== 'linux') {
  console.log(
    `cannot install widevine binary, ${platform} is a unsupported platform.`
  )
  process.exit(1)
}

const platformUrl =
  platform === 'darwin' ? 'mac' : platform === 'win32' ? 'win' : 'linux'

const linkToBinary = `https://dl.google.com/widevine-cdm/${WIDEVINE_VERSION}-${platformUrl}-${arch}.zip`

const zipDestination = path.join(__dirname, '..', 'dist', 'widevine.zip')
const extractDestination = path.join(__dirname, '..', 'dist', 'widevine')
const file = fs.createWriteStream(zipDestination)

https
  .get(linkToBinary, response => {
    response.pipe(file)

    file.on('finish', async () => {
      file.close()

      try {
        await extract(zipDestination, { dir: extractDestination })
        fs.unlinkSync(zipDestination)
      } catch (err) {
        console.error('Zip extraction failed. Error: ', err)
        process.exit(1)
      }
    })
  })
  .on('error', err => {
    fs.unlinkSync(zipDestination)
    console.error('Zip downloading failed. Error: ', err)
    process.exit(1)
  })
