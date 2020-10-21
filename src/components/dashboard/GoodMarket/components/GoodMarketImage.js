import React from 'react'
import { View } from 'react-native'

import Icon from '../../../common/view/Icon'

import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

import ArrowRight from '../../../../assets/arrowRight.svg'

const GoodMarketImage = ({ style, styles }) => (
  <View style={[style, styles.wrapper]}>
    <ArrowRight
      viewBox={`0 0 ${getDesignRelativeWidth(82)} ${getDesignRelativeHeight(74)}`}
      preserveAspectRatio="xMidYMid meet"
    />
    <Icon name="goodmarket" size={122} style={styles.marketIcon} />
  </View>
)

const mapStylesToProps = ({ theme }) => ({
  marketIcon: {
    marginLeft: -getDesignRelativeWidth(40, false),
    color: theme.colors.primary,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    overflowY: 'hidden',
  },
})

export default withStyles(mapStylesToProps)(GoodMarketImage)
