import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image, View } from 'react-native'
import { isMobileSafari } from 'mobile-device-detect'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { withStyles } from '../../../lib/styles'
import addAppIlustration from '../../../assets/addApp.svg'

import Text from '../../common/view/Text'

import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AddWebApp' })

const mapPropsToStyles = ({ theme }) => {
  return {
    image: {
      width: '100%',
      height: '15vh',
    },
    imageContainer: {
      padding: 32,
    },
    titleContainer: {
      borderTopWidth: 2,
      borderTopStyle: 'solid',
      borderTopColor: theme.colors.primary,
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      borderBottomColor: theme.colors.primary,
      paddingVertical: theme.sizes.default,
      marginVertical: theme.sizes.default,
    },
  }
}

const DiaglogTitle = withStyles(mapPropsToStyles)(({ children, styles }) => (
  <View style={styles.titleContainer}>
    <Text textAlign="left" fontSize={22} fontWeight="medium">
      {children}
    </Text>
  </View>
))

const DialogImage = props => (
  <View style={props.styles.imageContainer}>
    <Image style={props.styles.image} source={addAppIlustration} resizeMode="contain" {...props} />
  </View>
)

const InitialDialog = withStyles(mapPropsToStyles)(({ showDesc, styles }) => {
  return (
    <View style={styles.container}>
      <DialogImage styles={styles} />
      <DiaglogTitle>Add icon to home screen for easy access</DiaglogTitle>
      {showDesc && (
        <Text textAlign="left" color="gray80Percent" fontSize={14}>
          You can collect your daily GoodDollars with ease by adding this shortcut to your home screen.
        </Text>
      )}
    </View>
  )
})

const ExplanationDialog = withStyles(mapPropsToStyles)(({ styles }) => {
  return (
    <View style={styles.container}>
      <DiaglogTitle>Add icon to home screen for easy access</DiaglogTitle>
      <Text textAlign="left" color="gray80Percent" fontSize={14}>
        {'1. Open Share menu'}
      </Text>
      <Text textAlign="left" color="gray80Percent" fontSize={14}>
        {'2. Tap on "Add to Home Screen" button'}
      </Text>
    </View>
  )
})

const AddWebApp = props => {
  const [installPrompt, setInstallPrompt] = useState()
  const [lastCheck, setLastCheck] = useState()
  const [lastClaim, setLastClaim] = useState()
  const [dialogShown, setDialogShown] = useState()
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()
  const { show } = store.get('addWebApp')
  useEffect(() => {
    AsyncStorage.getItem('AddWebAppLastCheck')
      .then(dateSting => dateSting && new Date(dateSting))
      .then(setLastCheck)
    AsyncStorage.getItem('AddWebAppLastClaim')
      .then(dateSting => dateSting && new Date(dateSting))
      .then(setLastClaim)
  }, [])

  const showExplanationDialog = () => {
    log.debug('showExplanationDialog')
    showDialog({
      content: <ExplanationDialog />,
      onDismiss: () => {
        const date = new Date()
        AsyncStorage.setItem('AddWebAppLastCheck', date.toISOString())
      },
    })
  }

  const installApp = async () => {
    installPrompt.prompt()
    let outcome = await installPrompt.userChoice
    if (outcome.outcome == 'accepted') {
      log.debug('App Installed')
    } else {
      log.debug('App not installed')
    }

    // Remove the event reference
    setInstallPrompt(null)
  }

  const handleInstallApp = () => {
    if (installPrompt) {
      installApp()
    } else {
      showExplanationDialog()
    }
  }

  const showInitialDialog = isReminder => {
    showDialog({
      content: <InitialDialog showDesc={!isReminder} />,
      buttons: [
        {
          text: 'Later',
          mode: 'text',
          color: props.theme.colors.gray80Percent,
          onPress: dismiss => {
            log.debug('Canceled')
            const date = new Date()
            AsyncStorage.setItem('AddWebAppLastCheck', date.toISOString())
            dismiss()
          },
        },
        {
          text: 'Add Icon',
          onPress: dismiss => {
            log.debug('Add Icon')
            dismiss()
            handleInstallApp()
          },
        },
      ],
    })
  }

  useEffect(() => {
    log.debug('useEffect, registering beforeinstallprompt')

    window.addEventListener('beforeinstallprompt', e => {
      // For older browsers
      e.preventDefault()
      log.debug('Install Prompt fired')

      // See if the app is already installed, in that case, do nothing
      if (
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true
      ) {
        return
      }
      setInstallPrompt(e)
    })
  }, [])

  useEffect(() => {
    if (dialogShown) {
      showInitialDialog()
    }
  }, [dialogShown])

  useEffect(() => {
    log.debug({ installPrompt, show, lastCheck })

    // Condition to show reminder
    if (lastCheck) {
      const DAYS_TO_WAIT = 5
      const thirtyDaysFromLastDate = new Date()
      thirtyDaysFromLastDate.setDate(lastCheck.getDate() + DAYS_TO_WAIT)
      const today = new Date()
      log.debug({
        installPrompt,
        show,
        lastCheck,
        today,
        thirtyDaysFromLastDate,
        DAYS_TO_WAIT,
      })

      if (thirtyDaysFromLastDate < today || lastCheck > lastClaim) {
        return
      }
    }

    if ((installPrompt && show) || (isMobileSafari && show)) {
      setDialogShown(true)
    }
  }, [installPrompt, show, lastCheck])

  return null
}

export default withStyles()(AddWebApp)
