import React from 'react'
import { useTranslation } from 'react-i18next'
import DropdownItem from 'reactstrap/lib/DropdownItem'

export default () => {
    const { t } = useTranslation()

    return <DropdownItem header>{t('nothingFound')}</DropdownItem>
}
