import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import Ionicons from 'react-native-vector-icons/Ionicons'
import RNFetchBlob from 'react-native-fetch-blob'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

const _ = require('lodash')

export default class AudioPlay extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      toggle: true
    }
    this.lastTime = 0
    this.interval = 100 * 2
    this.audioRecorderPlayer = new AudioRecorderPlayer()
  }

  render() {
    const { url } = this.props
    const logoSize = 40
    return (
      <TouchableOpacity
        style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}
        onPress={async () => {
          this.audioRecorderPlayer.removePlayBackListener()

          this.audioRecorderPlayer.addPlayBackListener((e) => {
            const { current_position: currentPosition, duration } = e
            if (currentPosition - this.lastTime > this.interval) {
              this.setState({
                toggle: !this.state.toggle
              })
              this.lastTime = currentPosition
            }

            if (currentPosition === duration) {
              this.audioRecorderPlayer.stopPlayer().catch((err) => {
              })
              this.audioRecorderPlayer.removePlayBackListener()
              this.lastTime = 0
              this.setState({
                toggle: true
              })
            }
          })
          const fileName = _.last(url.split('/'))

          if (Platform.OS === 'ios') {
            let destination
            if (url.startsWith('/private')) {
              destination = url
            } else {
              const ary = url.split('Documents')
              const baseUrl = ary[0]

              destination = `/private${baseUrl}tmp/${fileName}`
            }

            const exist = await RNFetchBlob.fs.exists(destination)
            if (!exist) {
              const data = await RNFetchBlob.fs.readFile(url, 'base64')
              await RNFetchBlob.fs.writeFile(destination, data, 'base64')
            }
          }


          await this.audioRecorderPlayer.startPlayer(Platform.OS === 'ios' ? fileName : url)
        }}
      >
        <View style={{ width: logoSize, alignItems: 'flex-start', justifyContent: 'center' }}>
          <Ionicons
            name={this.state.toggle ? 'ios-volume-up-outline' : 'ios-volume-down-outline'}
            size={logoSize}
            style={{ marginRight: 3, lineHeight: logoSize, color: '#a0a0a0' }}
          />
        </View>

      </TouchableOpacity>
    )
  }
}

AudioPlay.defaultProps = {

}

AudioPlay.propTypes = {
  url: PropTypes.string
}
