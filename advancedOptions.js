/**
 * @file   advancedOptions.js
 * @brief  Advanced Options screen
 *
 * @responsible Jan Pejša
 * @author Jan Pejša
 */

kerio.woip.k_ui.advancedOptions = {

	k_encryptionStateEnum: {
		encrypted: 'encrypted',
		decrypted: 'decrypted'
	},

	k_encryptionActionEnum: {
		encrypting: 'encrypting',
		decrypting: 'decrypting',
		resizing: 'resizing',
		saving: 'saving',
		restoring: 'restoring'
	},

	k_init: function(k_objectName) {
		var
			k_localNamespace = k_objectName + '_',
			k_isAuditor = kerio.woip.k_userInfo.ROLE === k_CONST.KTS_Auditor,
			k_applyResetToolbar = kerio.woip.k_getApplyResetToolbar(k_localNamespace),
			k_formGeneral,
			k_formGeneralCfg,
			k_formTelephony,
			k_formBackupAndRecoveryCfg,
			k_formBackupAndRecovery,
			k_formOperatorClientLoginPage,
			k_formProductUpgradeCfg,
			k_formProductUpgrade,
			k_tabsCfg,
			k_tabs;

		k_formGeneralCfg = {

			/**
			 * check for changes in web server form
			 *
			 * @param k_form [object]
			 * @return [void]
			 */
			k_onChange: function(k_form) {
				var
					k_tabs = k_form.k_tabs,
					k_data = k_form.k_getData(true);

				// show/hide warning when time zone was changed
				k_form.k_getItem('k_timeZoneChangeWarning').k_setVisible(k_form._k_originalTimeZoneId !== k_data.k_timeZone);

				if (k_form._k_wasAutoChange) {
					delete k_form._k_wasAutoChange;
					return;
				}

				k_tabs.k_changedForms.k_formGeneral = true;
				if (!k_tabs._k_formsAreLoading) {
					k_tabs.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
				}
			}, // end of k_onChange

			k_labelWidth: 330,
			k_isReadOnly: k_isAuditor,
			k_items: [
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Date and Time', 'advancedSettings'),
					k_items: [
						{
							k_type: 'k_row',
							k_caption: k_tr('Current server date and time:', 'timeEditor'),
							k_items: [
								{
									k_id: 'k_currentDateTime',
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_isReadOnly: true,

									/**
									 * handle "not modified data"
									 */
									k_onChange: function(k_form) {
										k_form._k_wasAutoChange = true;
									} // end of k_onChange
								},
								{k_id: 'k_date', k_isHidden: true},
								{k_id: 'k_time', k_isHidden: true}
							]
						},
						{
							k_type: 'k_row',
							k_items: [
								{
									k_id: 'k_timeZone',
									k_type: 'k_select',
									k_caption: k_tr('Server time zone:', 'timeEditor'),
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_useColumnsNames: true,
									k_fieldDisplay: 'name',
									k_fieldValue: 'id',
									k_localData: []
								},
								{
									k_isHidden: true,
									k_id: 'k_timeZoneChangeWarning',
									k_type: 'k_display',
									k_isSecure: true,
									k_value: '<span ' + kerio.lib.k_buildTooltip(k_tr('A Reboot of Kerio Operator is required to apply the time zone changes.', 'timeEditor')) + '>' + k_tr('A Reboot is required.', 'timeEditor') + '</span>',
									k_className: 'warning'
								}
							]
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Email service', 'advancedSettings'),
					k_items: [
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_radio',
									k_groupId: 'k_smtpRelay_serviceType',
									k_value:  k_CONST.KTS_SmtpRelayTypeMyKerio,
									k_option: k_CONST.k_MyKerioName,
									k_isChecked: true,
									k_isLabelHidden: true,
									k_width: 310,
									k_onChange: function(k_form, k_item, k_value) {
										k_form.k_setDisabled(['k_smtpRelay_configure'], k_value !== k_CONST.KTS_SmtpRelayTypeSmtp);
										k_form.k_setDisabled(['k_smtpRelay_testRow'], k_value === k_CONST.KTS_SmtpRelayTypeNone);
									}
								},
								{
									k_type: 'k_display',
									k_id: 'k_myKerioEmailOk',
									k_className: 'info',
									k_indent: 1,
									k_value: k_tr('<a>%1</a> can be used to deliver emails up to 10 MB.', 'advancedSettings', {k_args: [k_CONST.k_MyKerioName]}),
									k_isSecure: true,
									k_onLinkClick: function() {
										kerio.woip._k_selectTab = 'k_formMyKerio';
										kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
									}
								},
								{
									k_type: 'k_display',
									k_id: 'k_myKerioEmailDisabled',
									k_className: 'warning',
									k_indent: 1,
									k_value: k_tr('Communication with <a>%1</a> is disabled.', 'integration', {k_args: [k_CONST.k_MyKerioName], k_comment: 'Communication with MyKerio is disabled.'}),
									k_isSecure: true,
									k_isHidden: true,
									k_onLinkClick: function() {
										kerio.woip._k_selectTab = 'k_formMyKerio';
										kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
									}
								},
								{
									k_type: 'k_display',
									k_id: 'k_myKerioEmailError',
									k_className: 'warning',
									k_indent: 1,
									k_value: k_tr('%1 is not connected to <a>%2</a>.', 'advancedSettings', {k_args: [k_CONST.SERVER_PRODUCT_FULL_NAME, k_CONST.k_MyKerioName], k_comment: 'Kerio Operator is not connected to MyKerio.'}),
									k_isSecure: true,
									k_isHidden: true,
									k_onLinkClick: function() {
										kerio.woip._k_selectTab = 'k_formMyKerio';
										kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
									}
								}
							]
						},
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_radio',
									k_groupId: 'k_smtpRelay_serviceType',
									k_value: k_CONST.KTS_SmtpRelayTypeSmtp,
									k_option: k_tr('%1 server', 'advancedSettings', {k_args: ['SMTP']}),
									k_isLabelHidden: true,
									k_width: 330
								},
								{
									k_type: 'k_formButton',
									k_caption: k_tr('Configure…', 'advancedSettings'),
									k_id: 'k_smtpRelay_configure',
									k_isDisabled: true,

									/**
									 * open advanced smtp configuration
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onClick: function(k_form) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'smtpServerSetting', k_objectName: 'smtpServerSetting', k_params: {k_masterForm: k_form}});
									} // end of k_onClick
								},
								{
									k_type: 'k_display',
									k_id: 'k_smtpRelay_hostname',
									k_className: 'italic',
									k_value: ''
								}
							]
						},
						{
							k_type: 'k_radio',
							k_groupId: 'k_smtpRelay_serviceType',
							k_value: k_CONST.KTS_SmtpRelayTypeNone,
							k_option: k_tr('None', 'advancedSettings'),
							k_isLabelHidden: true
						},
						{
							k_id: 'k_smtpQueueStatus',
							k_isSecure: true,
							k_type: 'k_display',
							k_isLabelHidden: true,
							k_onLinkClick: function (k_form, k_displayField, k_linkId) {
								if ('clearQueue' === k_linkId) {
									kerio.lib.k_confirm({
										k_title: k_tr('Question', 'common'),
										k_msg: k_tr('Do you want to clear the email queue now?', 'smtpTest'),
										k_icon: 'question',
										k_scope: k_form.k_tabs,
										k_callback: function(k_answer) {
											if (k_answer !== 'yes') {
												return;
											}
											kerio.lib.k_ajax.k_request({
												k_jsonRpc: {
													method: 'SmtpRelay.delete'
												},
												k_callback: function(k_response, k_success) {
													if (!k_success || !k_response.k_isOk) {
														return;
													}
													kerio.woip.k_methods.k_alertInfo(k_tr('The email queue is now cleared.', 'smtpTest'), this.k_reloadSmtp, this);
													kerio.woip.k_refreshNotifications();
												},
												k_scope: this
											});
										} // end of k_callback
									});
								}
								else if ('retryNow' === k_linkId) {
									kerio.lib.k_ajax.k_request({
										k_jsonRpc: {
											method: 'SmtpRelay.retry'
										},
										k_callback: function(k_response, k_success) {
											if (!k_success || !k_response.k_isOk) {
												return;
											}
											kerio.woip.k_methods.k_alertInfo(k_tr('An attempt to deliver queued emails will be made.', 'smtpTest'), this.k_reloadSmtp, this);
										},
										k_scope: k_form.k_tabs
									});

								}
								else if ('refresh' === k_linkId) {
									k_form.k_tabs.k_reloadSmtp();
								}
							}
						},
						{
							k_type: 'k_row',
							k_id: 'k_smtpRelay_testRow',
							k_items: [
								{
									k_id: 'k_smtpRelay_alertEmail',
									k_caption: k_tr('Send system alerts to:', 'advancedSettings'),
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_validator: {
										k_functionName: 'k_kerioWebEmail',
										k_allowBlank: true
									},
									k_maxLength: 195
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_smtpRelay_test',
									k_caption: k_tr('Test…', 'advancedSettings'),
									/**
									 * open dialog for send testing email
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onClick: function(k_form) {
										var
											k_itemAlertEmail = k_form.k_getItem('k_smtpRelay_alertEmail');

										if (k_form.k_tabs.k_changedForms.k_formGeneral) {
											kerio.woip.k_methods.k_alertWarn(k_tr('You have modified data. Save changes first.', 'advancedSettings'));
										}
										else {
											kerio.lib.k_ui.k_showDialog({k_sourceName: 'smtpTest', k_objectName: 'smtpTestRelay', k_params: {k_toAddress: k_itemAlertEmail.k_getValue(), k_parentWidget: k_form.k_tabs}});
										}
									} // end of k_onClick
								}
							]
						}
					]
				}
			]
		};

		if(!kerio.woip.k_inDocker){
			k_formGeneralCfg.k_items[0].k_items.splice(1, 0,{
				k_id: 'k_changeButton',
				k_type: 'k_formButton',
				k_caption: k_tr('Edit…', 'wlibButtons'),
				k_isDisabled: true,

				/**
				 * allow to set-up date and time
				 *
				 * @return [void]
				 */
				k_onClick: function(k_form, k_button) {
					kerio.lib.k_ui.k_showDialog({k_sourceName: 'dateTimeEditor', k_params: {k_relatedForm: k_form}});
				} // end of k_onClick
			});

			k_formGeneralCfg.k_items.splice(1, 0,{
				k_id: 'k_ntpEnabled',
				k_type: 'k_checkbox',
				k_indent: 1,
				k_option: k_tr('Keep synchronized with NTP servers', 'timeEditor'),
				k_isLabelHidden: true,
				k_isChecked: true,

				/**
				 * enable/disable hostname field
				 */
				k_onChange: function(k_form, k_item) {
					k_form.k_setDisabled('k_ntpHostname', !k_item.k_isChecked());
					k_form.k_setDisabled(['k_changeButton'], k_item.k_isChecked());
				} // end of k_onChange
			},
			{
				k_type: 'k_container',
				k_labelWidth: 310,
				k_items: [
					{
						k_id: 'k_ntpHostname',
						k_caption: k_tr('NTP servers:', 'timeEditor'),
						k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
						k_indent: 1,
						k_validator: {
							k_functionName: 'k_isMoreKerioWebDomainName'
						},
						k_maxLength: 1023
					}
				]
			});
		} //end of !kerio.woip.k_inDocker


		k_formGeneral = new kerio.lib.K_Form(k_localNamespace + 'k_formGeneral', k_formGeneralCfg);
		
		k_formTelephony = new kerio.lib.K_Form(k_localNamespace + 'k_formTelephony', {

			/**
			 * check for changes in web server form
			 *
			 * @param k_form [object]
			 * @return [void]
			 */
			k_onChange: function(k_form) {
				var
					k_tabs = k_form.k_tabs,
					k_data = k_form.k_getData(true);

				// show/hide warning when default country was changed
				k_form.k_getItem('k_defaultCountryChangeWarning').k_setVisible(k_form._k_originalCountry !== k_data.k_systemCountry);

				if (k_form._k_wasAutoChange) {
					delete k_form._k_wasAutoChange;
					return;
				}

				k_tabs.k_changedForms.k_formTelephony = true;
				if (!k_tabs._k_formsAreLoading) {
					k_tabs.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
				}
			}, // end of k_onChange

			k_labelWidth: 330,
			k_isReadOnly: k_isAuditor,
			k_items: [
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('PBX configuration', 'advancedSettings'),
					k_items: [
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_select',
									k_id: 'k_systemLanguage',
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_caption: k_tr('Default phone language:', 'advancedSettings'),
									k_localData: [],
									k_useColumnsNames: true,
									k_fieldDisplay: 'k_language',
									k_fieldValue: 'GUID'
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_configureButtonDefaultPhoneLanguage',
									k_caption: k_tr('Configure…', 'advancedSettings'),

									/**
									 * open advanced smtp configuration
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onClick: function(k_form) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'voicePromptList', k_params: {k_masterForm: k_form}});
									} // end of k_onClick
								},
								{
									k_type: 'k_display',
									k_isLabelHidden: true,
									k_isSecure: true,
									k_forceWritable: true,
									k_value: kerio.adm.k_getKbLink(940)
								}
							]
						},
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_select',
									k_id: 'k_systemCountry',
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_caption: k_tr('Default country:', 'advancedSettings'),
									k_localData: [],
									k_useColumnsNames: true,
									k_fieldDisplay: 'name',
									k_fieldValue: 'guid'
								},
								{
									k_isHidden: true,
									k_id: 'k_defaultCountryChangeWarning',
									k_type: 'k_display',
									k_isSecure: true,
									k_value: '<span ' + kerio.lib.k_buildTooltip(k_tr('A restart of the telephony subsystem is required to apply the default country changes.', 'advancedOptions')) + '>' + k_tr('A restart of the telephony subsystem is required.', 'advancedOptions') + '</span>',
									k_className: 'warning'
								}
							]
						},
						{
							k_id: 'k_pbxStartingNumber',
							k_caption: k_tr('First extension number:', 'advancedSettings'),
							k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
							k_maxLength: 16,
							k_validator: {
								k_functionName: 'k_lineNumber',
								k_allowBlank: false
							}
						},
						{
							k_caption: k_tr('While forwarding a call:', 'advancedSettings'),
							k_id: 'k_userCallForwardingSettings',
							k_type: 'k_select',
							k_useColumnsNames: true,
							k_fieldDisplay: 'k_name',
							k_fieldValue: 'k_value',
							k_value: k_CONST.KTS_UserCallForwardingBackgroundPlsHold,
							k_localData: [
								{k_name: k_tr('Play the "Please hold…" voice prompt, then the ring indication', 'advancedSettings'), k_value: k_CONST.KTS_UserCallForwardingBackgroundPlsHold},
								{k_name: k_tr('Generate a ringing tone immediately', 'advancedSettings'), k_value: k_CONST.KTS_UserCallForwardingBackgroundRinging},
								{k_name: k_tr('Play the default Music on Hold', 'advancedSettings'), k_value: k_CONST.KTS_UserCallForwardingBackgroundMoh},
								{k_name: k_tr('Ring only after ring indication', 'advancedSettings'), k_value: k_CONST.KTS_UserCallForwardingBackgroundSilence}
							],
							k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN
						},
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_checkbox',
									k_id: 'k_transferTimeoutEnabled',
									k_option: k_tr('Transfer timeout:', 'advancedSettings'),
									k_isLabelHidden: true,
									k_width: 330,
									k_isChecked: true,

									/**
									 * enable/disable hostname field
									 */
									k_onChange: function(k_form, k_item) {
										k_form.k_setDisabled(['k_transferTimeout', 'k_transferTimeoutLabel'], !k_item.k_isChecked());
									} // end of k_onChange
								},
								{
									k_type: 'k_spinner',
									k_id: 'k_transferTimeout',
									k_value: 15,
									k_minValue: 1,
									k_maxValue: 300,
									k_maxLength: 3
								},
								{
									k_type: 'k_display',
									k_id: 'k_transferTimeoutLabel',
									k_isLabelHidden: true,
									k_width: 100,
									k_value: k_tr('seconds', 'timeDurationCommon')
								},
								'->'
							]
						},
						{
							k_type: 'k_checkbox',
							k_id: 'k_attendedTransferBeep',
							k_option: k_tr('Beep when an attended transfer is finished', 'advancedSettings'),
							k_isLabelHidden: true,
							k_isChecked: true
						},
						{
							k_type: 'k_row',
							k_className: 'rowWithCaptionAndButton',
							k_items: [
								{
									k_type: 'k_display',
									k_caption: k_tr('SIP configuration:', 'advancedSettings')
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_configureButtonSip',
									k_caption: k_tr('Configure…', 'advancedSettings'),
									k_onClick: function(k_form) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'advancedOptionsSip', k_objectName: 'advancedOptionsSip'});
									} // end of k_onClick
								},
								'->'
							]
						},
						{
							k_caption: k_tr('Maximum number of concurrent calls:', 'advancedSettings'),
							k_id: 'k_maxCalls',
							k_type: 'k_spinner',
							k_maxLength: 3,
							k_maxValue: 500,
							k_minValue: 1
						},
						{
							k_caption: k_tr('Maximum number of messages recorded concurrently:', 'advancedSettings'),
							k_id: 'k_maxVoicemailCalls',
							k_type: 'k_spinner',
							k_maxLength: 2,
							k_maxValue: 50,
							k_minValue: 1
						},
						{
							k_type: 'k_row',
							k_className: 'rowWithCaptionAndButton',
							k_items: [
								{
									k_type: 'k_display',
									k_caption: k_tr('Strip accents from full names:', 'advancedSettings')
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_configureButtonStripAccents',
									k_caption: k_tr('Configure…', 'advancedSettings'),

									/**
									 * open transliteration editor
									 *
									 * @return [void]
									 */
									k_onClick: function() {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'transliterationEditor', k_objectName: 'transliterationEditor'});
									} // end of k_onClick
								},
								'->'
							]
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('%1 for desktop and web', 'advancedSettings', {k_args: ['Kerio Phone']}),
					k_items: [
						{
							k_type: 'k_checkbox',
							k_id: 'k_webrtcEnabled',
							k_option: k_tr('Enable computer calls', 'operatorClient'),
							k_isLabelHidden: true,
							k_isChecked: true,
							k_onChange: function(k_form, k_item, k_value) {
								k_form.k_setDisabled('k_useOpusCodec', !k_value);
							}
						},
						{
							k_type: 'k_checkbox',
							k_id: 'k_useOpusCodec',
							k_option: k_tr('Prefer %1 codec for computer calls (CPU intensive)', 'operatorClient', {k_args: [k_CONST.text_Opus]}),
							k_isLabelHidden: true,
							k_isChecked: true
						}
					]
				}
			]
		});

		k_formTelephony.k_getItem('k_configureButtonDefaultPhoneLanguage').k_forceSetWritable();
		k_formTelephony.k_getItem('k_configureButtonStripAccents').k_forceSetWritable();
		k_formTelephony.k_getItem('k_configureButtonSip').k_forceSetWritable();

		k_formBackupAndRecoveryCfg = {
			k_useStructuredData: true,

			/**
			 * check for changes in backup and recovery form
			 *
			 * @param k_form [object]
			 * @return [void]
			 */
			k_onChange: function(k_form) {
				var
					k_tabs = k_form.k_tabs;

				k_tabs.k_changedForms.k_formBackupAndRecovery = true;
				if (!k_tabs._k_formsAreLoading) {
					k_tabs.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
				}

			}, // end of k_onChange

			k_items: [
				{
					k_labelWidth: 200,
					k_caption: k_tr('Remote backup', 'backupAndRecoveryEditor'),
					k_type: 'k_fieldset',
					k_items: [
						{
							k_type: 'k_container',
							k_isReadOnly: k_isAuditor,
							k_items: [
								{
									k_type: 'k_display',
									k_caption: k_tr('Last backup performed:', 'backupAndRecoveryEditor'),
									k_id: 'k_status',
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_isSecure: true,

									k_onLinkClick: function(k_form, k_item, k_linkId) {
										if ('k_backupCancel' === k_linkId) {
											k_form.k_tabs.k_cancelBackup();
										}
									} // end of k_onLinkClick
								},
								{
									k_type: 'k_row',
									k_items: [
										{
											k_id: 'type',
											k_type: 'k_select',
											k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
											k_caption: k_tr('Type:', 'recordedCallsSettings'),
											k_useColumnsNames: true,
											k_fieldDisplay: 'k_name',
											k_fieldValue: 'k_value',
											k_localData: [
												{k_name: k_CONST.k_MyKerioName, k_value: k_CONST.KTS_RemoteStorageProtocolMyKerio},
												{k_name: 'FTP', k_value: k_CONST.KTS_RemoteStorageProtocolFtp}
											],

											/**
											 * update caption of remotePath
											 */
											k_onChange: function(k_form, k_item, k_value) {
												k_form.k_setVisible(['k_rowFtp'], k_value === k_CONST.KTS_RemoteStorageProtocolFtp);
												k_form.k_setVisible(['k_rowMyKerio'], k_value === k_CONST.KTS_RemoteStorageProtocolMyKerio);

												if (!k_form._k_isAutomaticSetData) {
													k_form.k_getItem('path').k_setValue('');
													kerio.woip.k_updateRemoteStoragePathLink(k_form);
												}
											} // end of k_onChange
										},
										{
											k_type: 'k_display',
											k_isSecure: true,
											k_value: k_tr('<a>Configure…</a>', 'recordedCallsSettings'),
											k_onLinkClick: function(k_form) {
												switch(k_form.k_getItem('type').k_getValue()) {
													case k_CONST.KTS_RemoteStorageProtocolFtp:
														kerio.woip._k_selectTab = 'k_remoteStorage';
														break;
													case k_CONST.KTS_RemoteStorageProtocolMyKerio:
														kerio.woip._k_selectTab = 'k_formMyKerio';
														break;
												}
												kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
											} // end of k_onLinkClick
										}
									]
								},
								{k_id: 'path', k_isHiddenField: true},
								{
									k_type: 'k_container',
									k_id: 'k_rowFtp',
									k_items: [
										{
											k_type: 'k_row',
											k_items: [
												{
													k_id: 'k_path',
													k_type: 'k_display',
													k_caption: k_tr('Path:', 'recordedCallsSettings'),
													k_className: 'longLinkInRow',
													k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
													k_template: '<span class="italic">{text}</span><a ext:qtip="{tooltipLink}">{link}</a>',
													k_value: {text: k_tr('Empty', 'recordedCallsSettings'), link: ''},
													k_onLinkClick: kerio.woip.k_onRemoteStorageLinkClick
												},
												{
													k_type: 'k_formButton',
													k_caption: k_tr('Edit…', 'wlibButtons'),

													k_onClick: function(k_form) {
														if (!kerio.woip.k_isRemoteStorageConfigured(k_form).k_isConfigured) {
															kerio.woip.k_methods.k_alertWarn(k_tr('This remote storage is probably not configured yet.', 'recordedCallsSettings'));
															return;
														}
														kerio.lib.k_ui.k_showDialog({k_sourceName: 'remoteStorageChangePath', k_objectName: 'remoteStorageChangePath', k_params: {k_masterForm: k_form, k_type: k_form.k_getItem('type').k_getValue()}});
													} // end of k_onClick
												}
											]
										},
										{
											k_id: 'rotation',
											k_caption: k_tr('Number of files to keep:', 'backupAndRecoveryEditor'),
											k_type: 'k_spinner',
											k_value: 7,
											k_minValue: 0,
											k_maxValue: 100,
											k_maxLength: 3,
											k_validator: {
												k_allowBlank: false
											}
										}
									]
								},
								{
									k_type: 'k_container',
									k_id: 'k_rowMyKerio',
									k_height: 48,
									k_items: [
										{
											k_id: 'k_myKerioUrl',
											k_type: 'k_display',
											k_caption: k_tr('URL:', 'recordedCallsSettings'),
											k_className: 'longLinkInRow',
											k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
											k_template: '<a ext:qtip="{tooltipLink}">{link}</a>',
											k_value: {text: k_tr('Not connected', 'recordedCallsSettings'), link: ''},
											k_onLinkClick: kerio.woip.k_onRemoteStorageMyKerioLinkClick
										},
										{
											k_id: 'k_myKerioBackupDisabled',
											k_className: 'warning',
											k_type: 'k_display',
											k_isSecure: true,
											k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
											k_value: k_tr('Communication with <a>%1</a> is disabled.', 'integration', {k_args: [k_CONST.k_MyKerioName], k_comment: 'Communication with MyKerio is disabled.'}),
											k_onLinkClick: function() {
												kerio.woip._k_selectTab = 'k_formMyKerio';
												kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
											}
										},
										{
											k_id: 'k_myKerioBackupNotPaired',
											k_className: 'warning',
											k_type: 'k_display',
											k_isSecure: true,
											k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
											k_value: k_tr('%1 has not been added to <a>%2</a>.', 'advancedSettings', {k_args: [k_CONST.SERVER_PRODUCT_FULL_NAME, k_CONST.k_MyKerioName], k_comment: 'Kerio Operator is not connected to MyKerio.'}),
											k_onLinkClick: function() {
												kerio.woip._k_selectTab = 'k_formMyKerio';
												kerio.adm.k_framework._k_mainLayout.k_menuTree.k_selectNode('integration');
											}
										}
									]
								},
								{
									k_type: 'k_formButton',
									k_className: 'paddingBottom10',
									k_id: 'k_startRemoteBackupButton',
									k_caption: k_tr('Backup on Remote Storage…', 'backupAndRecoveryEditor'),

									k_onClick: function(k_form) {

										var
											k_data;

										if (!kerio.woip.k_isRemoteStorageConfigured(k_form).k_isConfigured) {
											kerio.woip.k_methods.k_alertWarn(k_tr('This remote storage is probably not configured yet.', 'recordedCallsSettings'));
											return;
										}

										k_data = k_form.k_getData(true);

										kerio.lib.k_ui.k_showDialog({k_sourceName: 'backupRemote', k_objectName: 'backupRemoteStartNow', k_params: {k_masterForm: k_form}});

									} // end of k_onClick
								},
								{
									k_type: 'k_checkbox',
									k_isLabelHidden: true,
									k_id: 'enabled',
									k_option: k_tr('Enable automatic backup to remote storage', 'backupAndRecoveryEditor'),

									/**
									 * enable/disable related fields
									 */
									k_onChange: function(k_form, k_item, k_value) {
										k_form.k_setDisabled('k_autoSettings', !k_value);
										kerio.woip.k_updateRemoteStoragePathLink(k_form);
									} // end of k_onChange
								},
								{
									k_type: 'k_container',
									k_id: 'k_autoSettings',
									k_labelWidth: 180,
									k_isDisabled: true,
									k_indent: 1,
									k_items: [
										{
											k_caption: k_tr('Start at:', 'backupAndRecoveryEditor'),
											k_id: 'startAt',
											k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
											k_value: '01:00',
											k_validator: {
												k_functionName: 'k_kerioWebTime',
												k_allowBlank: false
											},
											k_maxLength: 5
										},
										{
											k_type: 'k_row',
											k_caption: k_tr('Period:', 'backupAndRecoveryEditor'),
											k_items: [
												{
													k_id: 'period',
													k_type: 'k_spinner',
													k_value: 2 * 3600 * 24,
													k_minValue: 1,
													k_maxValue: 100,
													k_maxLength: 3
												},
												{
													k_type: 'k_display',
													k_isLabelHidden: true,
													k_width: 100,
													k_value: k_tr('days', 'timeDurationCommon')
												},
												'->'
											]
										},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.SYSTEM_DATABASE'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.VOICE_MAIL'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.SYSTEM_LOG'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.CALL_LOG'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.LICENSE'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.RECORDED_CALLS'},
										{k_type: 'k_checkbox', k_isHidden: true, k_id: 'sections.TFTP'},
										{
											k_type: 'k_row',
											k_items: [
												{
													k_type: 'k_display',
													k_isLabelHidden: true,
													k_value: k_tr('Content:', 'backupAndRecoveryEditor'),
													k_width: 180
												},
												{
													k_type: 'k_formButton',
													k_caption: k_tr('Edit…', 'wlibButtons'),

													/**
													 * open advanced smtp configuration
													 *
													 * @param k_form [object]
													 * @return [void]
													 */
													k_onClick: function(k_form) {
														kerio.lib.k_ui.k_showDialog({k_sourceName: 'backupRemote', k_objectName: 'backupRemoteConfiguration', k_params: {k_masterForm: k_form}});
													} // end of k_onClick
												},
												{
													k_type: 'k_display',
													k_id: 'k_backupContent',
													k_className: 'italic'
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_isReadOnly: k_isAuditor,
					k_isHidden: kerio.lib.k_isIPad,
					k_labelWidth: 200,
					k_caption: k_tr('Backup', 'backupAndRecoveryEditor'),
					k_items: [
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_formButton',
									k_id: 'k_startLocalBackupButton',
									k_caption: k_tr('Download Backup File…', 'backupAndRecoveryEditor'),
									k_onClick: function(k_form) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'backupManual', k_params: {k_masterForm: k_form}});
									} // end of k_onClick
								},
								{
									k_type: 'k_display',
									k_id: 'k_localBackupInfo',
									k_isSecure: true,
									k_isLabelHidden: true,
									k_isHidden: true,
									k_onLinkClick: function(k_form, k_item, k_linkId) {
										if ('k_backupCancel' === k_linkId) {
											k_form.k_tabs.k_cancelBackup();
										}
										if ('k_backupDownload' === k_linkId) {
											k_form.k_tabs.k_startLocalDownload();
										}
									} // end of k_onLinkClick
								}
							]
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_isReadOnly: k_isAuditor,
					k_isHidden: kerio.lib.k_isIPad,
					k_caption: k_tr('Recovery', 'backupAndRecoveryEditor'),
					k_items: [
						{
							k_type: 'k_row',
							k_height: 25,
							k_items: [
								{
									k_type: 'k_formUploadButton',
									k_id: 'k_uploadBackupFile',
									k_caption: k_tr('Upload Backup File…', 'backupAndRecoveryEditor'),
									k_remoteData: {
										k_jsonRpc: {
											method: 'SystemBackup.restoreUpload'
										}
									},

									/**
									 * change some info items before the upload starts
									 *
									 * @param k_form [object]
									 * @param k_item [object]
									 * @param k_value [string]
									 * @return [void]
									 */
									k_onBeforeUpload: function (k_form, k_item, k_value) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'fileUploadProgress'});
										k_form.k_setVisible('k_uploadedRecoveryFileInfo', false);
									},

									/**
									 * when file was uploaded
									 *
									 * @param k_form [object]
									 * @param k_item [object]
									 * @param k_response [object]
									 * @param k_success [boolean]
									 * @return [void]
									 */
									k_onUpload: function(k_form, k_item, k_response, k_success) {
										kerio.lib.k_uiCacheManager.k_get('fileUploadProgress').k_hide();
										if (k_success && k_response.k_isOk) {
											k_form.k_setVisible('k_uploadedRecoveryFileInfo');
											k_form.k_setDisabled('k_uploadBackupFile');
											kerio.lib.k_ui.k_showDialog({k_sourceName: 'recovery', k_params: {k_masterForm: this.k_form}});
										}
									} // end of k_onUpload
								},
								{
									k_type: 'k_display',
									k_id: 'k_uploadedRecoveryFileInfo',
									k_value: k_tr('Backup file was uploaded.', 'backupAndRecoveryEditor') + ' ' +
									         '<a id="k_openDialog">' + k_tr('Open Recovery dialog', 'backupAndRecoveryEditor') + '</a>' + ' ' +
									         '<a id="k_removeFile">' + k_tr('Remove uploaded backup file', 'backupAndRecoveryEditor') + '</a>',
									k_isHidden: true,
									k_isSecure: true,

									k_onLinkClick: function(k_form, k_item, k_linkId) {
										if ('k_openDialog' === k_linkId) {
											kerio.lib.k_ui.k_showDialog({k_sourceName: 'recovery', k_params: {k_masterForm: k_form}});
										}
										else if ('k_removeFile') {
											k_form.k_tabs.k_removeRestoreUploadedFile();
										}
									} // end of k_onLinkClick
								},
								'->'
							]
						}
					]
				}
			]

		};
		k_formBackupAndRecovery = new kerio.lib.K_Form(k_localNamespace + 'k_formBackupAndRecovery', k_formBackupAndRecoveryCfg);

		k_formOperatorClientLoginPage = new kerio.lib.K_Form(k_localNamespace + 'k_formOperatorClientLoginPage', {
				k_useStructuredData: true,

				k_onChange: function(k_form) {
					var k_tabs = k_form.k_tabs;

					if (k_form._k_wasAutoChange) {
						delete k_form._k_wasAutoChange;
						return;
					}

					k_tabs.k_changedForms.k_formOperatorClientLoginPage = true;
					if (!k_tabs._k_formsAreLoading) {
						k_tabs.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
					}
				}, // end of k_onChange

				k_items: [
					{
						k_type: 'k_fieldset',
						k_caption: k_tr('Login page customization for %1 for web', 'operatorClient', {k_args: ['Kerio Phone'], k_comment: '...for Kerio Phone for web'}),
						k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN + 150 + 20,
						k_labelWidth: 150,
						k_items: [
							{
								k_type: 'k_checkbox',
								k_isLabelHidden: true,
								k_option: k_tr('Use custom logo on login page', 'operatorClient'),
								k_id: 'customLoginPage.logo.isEnabled',

								/**
								 * enable/disable related fields
								 */
								k_onChange: function(k_form, k_item, k_value) {
									k_form.k_setDisabled(['customLoginPage.logo.url', 'fileId'], !k_value);
								} // end of k_onChange
							},
							{
								k_type: 'k_display',
								k_id: 'customLoginPage.logo.url',
								k_isDisabled: true,
								k_indent: 1,
								k_width: 327,  // size is taken from login dialog + 2px for each side (1px border is in Administration used)
								k_height: 82,
								k_className: 'imageBorder loginLogoImg'
							},
							{k_id: 'customLoginPage.logo.id', k_isHidden: true}, // data only
							{
								k_type: 'k_formUploadButton',
								k_isHidden: kerio.lib.k_isIPad,
								k_caption: k_tr('Change…', 'operatorClient'),
								k_isDisabled: true,
								k_indent: 1,
								k_id: 'fileId',

								k_remoteData: {
									k_isAutoUpload: false,
									k_isOneStepUpload: true
								},

								// allow upload only PNG files
								k_onChange: function (k_form, k_item, k_value) {
									if (true === k_item._k_afterUploadChange) {
										return;
									}

									k_item.k_upload();

								}, // end of k_onChange

								k_onBeforeUpload: function(k_form, k_item, k_value) {

									kerio.lib.k_ui.k_showDialog({k_sourceName: 'fileUploadProgress'});

								}, // end of k_onBeforeUpload

								k_onUpload: function(k_form, k_item, k_response, k_success) {

									kerio.lib.k_uiCacheManager.k_get('fileUploadProgress').k_hide();

									if (k_success && k_response.k_isOk) {
										k_item._k_afterUploadChange = true;
										k_form.k_setData({
											'customLoginPage.logo.url': '/admin/download/prepare.php?type=customLogoPreview&guid=' + k_response.k_decoded.fileUpload.id + '&' + new Date().getTime(),
											'customLoginPage.logo.id': k_response.k_decoded.fileUpload.id
										});
										delete k_item._k_afterUploadChange;
									}

								} // end of k_onUpload
							},
							{
								k_type: 'k_display',
								k_value: k_tr('Recommended size is %1px wide and %2px high.', 'operatorClient', {k_args: ['325', '80']}),
								k_isLabelHidden: true,
								k_className: 'info',
								k_indent: 1
							},
							{
								k_type: 'k_checkbox',
								k_isLabelHidden: true,
								k_option: k_tr('Use custom button style', 'operatorClient'),
								k_id: 'customLoginPage.buttonColor.isEnabled',

								/**
								 * enable/disable related fields
								 */
								k_onChange: function(k_form, k_item, k_value) {
									k_form.k_setDisabled(['customLoginPage.buttonColor.textColor', 'customLoginPage.buttonColor.backgroundColor'], !k_value);
								} // end of k_onChange
							},
							{
								k_caption: k_tr('Text color:', 'operatorClient'),
								k_emptyText: '#ffffff',
								k_indent: 1,
								k_isDisabled: true,
								k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
								k_id: 'customLoginPage.buttonColor.textColor'
							},
							{
								k_caption: k_tr('Background color:', 'operatorClient'),
								k_emptyText: '#f77c0f',
								k_indent: 1,
								k_isDisabled: true,
								k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
								k_id: 'customLoginPage.buttonColor.backgroundColor'
							},
							{
								k_type: 'k_checkbox',
								k_isLabelHidden: true,
								k_option: k_tr('Add the following text to the page (supports %1)', 'operatorClient', {k_args: ['HTML']}),
								k_id: 'customLoginPage.additionalInfo.isEnabled',

								/**
								 * enable/disable related fields
								 */
								k_onChange: function(k_form, k_item, k_value) {
									k_form.k_setDisabled('customLoginPage.additionalInfo.text', !k_value);
								} // end of k_onChange
							},
							{
								k_type: 'k_columns',
								k_items: [
									{
										// 20 is k_indent; 150 is k_labelWidth; 5 is probably some padding/margin of the k_columns type...
										k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN + 150 + 20 + 5,
										k_type: 'k_container',
										k_items: [
											{
												k_type: 'k_textArea',
												k_indent: 1,
												k_height: 100,
												k_isDisabled: true,
												k_isLabelHidden: true,
												k_id: 'customLoginPage.additionalInfo.text',
												k_maxLength: kerio.lib.k_constants.k_TEXT_AREA_MAX_LENGTH
											}
										]
									}
								]
							}
						]
					}
				]
		}); // end of k_formOperatorClientLoginPage

		// Methods for set and get value of logo url are overridden for special functionality.
		Ext.apply(k_formOperatorClientLoginPage.k_getItem('customLoginPage.logo.url'), {
			// overridden - we need handle background image
			k_setValue: k_formOperatorClientLoginPage.k_getItem('customLoginPage.logo.url').k_setValue.createSequence(function(k_value) {

				if ('' === k_value) {
					k_value = '/admin/download/prepare.php?type=customLogoPreview';
				}

				this._k_value = k_value;

				if (this._k_isExecutionDeferredAfterRender(arguments.callee, arguments)) {
					return;
				}

				if (kerio.lib.k_isMyKerio) {
					k_value = kerio.lib.k_ajax.k_changeDownloadUrlForMyKerio(k_value);
				}

				this.k_extWidget.el.setStyle('backgroundImage', 'url("' + k_value + '&' + new Date().getTime() + '")');
			}),

			k_getValue: function() {
				return this._k_value;
			}
		});

		k_formProductUpgradeCfg = {
			k_isReadOnly: k_isAuditor,

			/**
			 * check for changes in product upgrade form
			 *
			 * @param k_form [object]
			 * @return [void]
			 */
			k_onChange: function(k_form) {
				var
					k_tabs = k_form.k_tabs;

				k_tabs.k_changedForms.k_formProductUpgrade = true;
				if (!k_tabs._k_formsAreLoading) {
					k_tabs.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
				}
			}, // end of k_onChange

			k_labelWidth: 200,
			k_items: [
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Update checker settings', 'upgradeEditor'),
					k_items: [
						{
							k_type: 'k_checkbox',
							k_id: 'enabled',
							k_isLabelHidden: true,
							k_option: k_tr('Periodically check for new versions', 'upgradeEditor'),

							/**
							 * Enables or disables Beta checkbox
							 *
							 * @param k_form [object]
							 * @param k_checkbox [object]
							 * @param k_isChecked [boolean]
							 * @return [void]
							 */
							k_onChange: function(k_form, k_checkbox, k_isChecked) {
								k_form.k_setDisabled(['sendClientStatistics', 'download', 'sendNotification'], !k_isChecked);
							} // end of k_onChange
						},
						{
							k_type: 'k_checkbox',
							k_id: 'download',
							k_isLabelHidden: true,
							k_indent: 1,
							k_option: k_tr('Download new versions automatically', 'upgradeEditor')
						},
						{
							k_type: 'k_checkbox',
							k_id: 'sendClientStatistics',
							k_isLabelHidden: true,
							k_indent: 1,
							k_option: k_tr('Send anonymous usage statistics to Kerio Technologies', 'upgradeEditor')
						},
						{
							k_type: 'k_display',
							k_template: '<a>{k_link}</a>',
							k_forceWritable: true,
							k_indent: 2,
							k_value: {
								k_link: k_tr('View sample data', 'upgradeEditor')
							},
							k_onLinkClick: function() {
								kerio.lib.k_ui.k_showDialog({k_sourceName: 'contributeDialogSample'});
							}
						},
						{
							k_type: 'k_checkbox',
							k_id: 'sendNotification',
							k_isLabelHidden: true,
							k_indent: 1,
							k_option: k_tr('Send email alert when new version is available', 'upgradeEditor')
						},
						{
							k_type: 'k_checkbox',
							k_id: 'betaVersion',
							k_isLabelHidden: true,
							k_option: k_tr('Check also for beta versions', 'upgradeEditor')
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Update status', 'upgradeEditor'),
					k_items: [
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_formButton',
									k_id: 'k_updateNow',
									k_caption: k_tr('Check Now', 'upgradeEditor'),

									/**
									 * Handles click on Update Now button
									 *
									 * @param  k_form [KerioWidget] parent form
									 * @return [void]
									 */
									k_onClick: function(k_form) {
										k_form.k_tabs.k_startUpdateCheckerCheck();
									} // end of k_onClick
								},
								{
									k_type: 'k_simpleText',
									k_isLabelHidden: true,
									k_value: k_tr('Last update check performed:', 'upgradeEditor')
								},
								{
									k_type: 'k_simpleText',
									k_isLabelHidden: true,
									k_caption: k_tr('Last update check performed:', 'upgradeEditor'),
									k_id: 'k_lastUpdateAgo',
									k_value: k_tr('Never', 'upgradeEditor')
								},
								'->'
							]
						},
						{
							k_type: 'k_row',
							k_items: [
								{
									k_type: 'k_simpleText',
									k_isLabelHidden: true,
									k_id: 'k_updateDownloadLink',
									k_value: k_tr('No update has been performed yet.', 'upgradeEditor')
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_download',
									k_caption: k_tr('Download', 'upgradeEditor'),
									k_isHidden: true,

									/**
									 * Handles click on Download button
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onClick: function(k_form) {

										// also check last status because the download is using configuration stored in database
										k_form.k_tabs.k_startUpdateCheckerCheck();

										k_form.k_setDisabled(['k_download'], true);
										k_form._k_showWarningOnDownloadFailure = true;
										k_form.k_getItem('k_downloadProgress').k_setValue(0);
										kerio.lib.k_ajax.k_request({
												k_jsonRpc: {
													method: 'UpdateChecker.download'
												},
												k_callback: k_form.k_tabs.k_startDownloadStatus,
												k_scope: k_form.k_tabs
										});
									} // end of k_onClick
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_upgradeStart',
									k_isHidden: true,
									k_caption: k_tr('Upgrade…', 'upgradeEditor'),

									/**
									 * start upgrade
									 *
									 * @param k_form [object]
									 * @param k_button [object]
									 * @return [void]
									 */
									k_onClick: function(k_form, k_button) {
										k_form.k_tabs._k_info.k_upgradeFromDownloadFile = true;
										k_form.k_tabs.k_showProductUpgrade(true, k_button);
									} // end of k_onClick
								},
								'->'
							]
						},
						{
							k_type: 'k_row',
							k_isHidden: true,
							k_id: 'k_downloadStatus',
							k_items: [
								{
									k_id: 'k_downloadStatusText',
									k_type: 'k_display',
									k_isLabelHidden: true,
									k_value: k_tr('Download in progress:', 'upgradeEditor'),
									k_width: 180
								},
								{
									k_type: 'k_progressBar',
									k_id: 'k_downloadProgress',
									k_width: k_CONST.k_FORM_FIELD_WIDTH_IN_WIDE_SCREEN,
									k_maxValue: 100,
									k_minValue: 0,
									k_value: 0
								},
								{
									k_type: 'k_formButton',
									k_id: 'k_downloadCancel',
									k_caption: k_tr('Cancel', 'wlibButtons'),

									/**
									 * cancel download
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onClick: function(k_form) {
										kerio.woip.k_taskRunner.k_stop('k_autoUpdateDownloadStatus');
										k_form.k_setReadOnly('k_downloadStatus');
										kerio.lib.k_ajax.k_request({
												k_jsonRpc: {
													method: 'UpdateChecker.cancelDownload'
												},
												k_callback: k_form.k_tabs.k_cancelDownloadStatus,
												k_scope: k_form.k_tabs
										});
									} // end of k_onClick
								}
							]
						}
					]
				},
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Upgrade by uploading binary file', 'upgradeEditor'),
					k_labelWidth: 150,
					k_isHidden: kerio.lib.k_isIPad,
					k_items: [
						{
							k_type: 'k_row',
							k_className: 'rowWithCaptionAndButton',
							k_height: 25,
							k_items: [
								{
									k_type: 'k_formUploadButton',
									k_id: 'uploadFile',
									k_caption: k_tr('Upload Binary Image…', 'upgradeEditor'),
									k_remoteData: {
										k_jsonRpc: {
											method: 'UpdateChecker.uploadNewBinary'
										}
									},

									/**
									 * change some info items before the upload starts
									 *
									 * @param k_form [object]
									 * @return [void]
									 */
									k_onBeforeUpload: function (k_form) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'fileUploadProgress'});
										k_form.k_setVisible(['k_startUpgrade', 'k_startDowngrade', 'k_uploadInfo', 'k_upgradeCurrentVersion', 'k_upgradeUploadedVersion'], false);
										k_form.k_getItem('k_uploadInfo').k_removeClassName('actionResultOk');
									},

									/**
									 * when binary file is uploaded
									 *
									 * @param k_form [object]
									 * @param k_item [object]
									 * @param k_response [object]
									 * @param k_success [boolean]
									 *
									 */
									k_onUpload: function(k_form, k_item, k_response, k_success) {

										kerio.lib.k_uiCacheManager.k_get('fileUploadProgress').k_hide();

										if (k_success && k_response.k_isOk) {

											var
												k_woip = kerio.woip,
												k_info = k_response.k_decoded.info,
												k_serverBuildVersion = k_CONST.SERVER_BUILDVERSION,
												k_currentVersion = k_woip.k_getProductVersion(k_serverBuildVersion),
												k_currentBuild = k_woip.k_getProductBuild(k_serverBuildVersion),
												k_newVersion = k_info.version,
												k_newBuild = k_info.buildNumber,
												k_isUpgrade = (k_newVersion > k_currentVersion) || (k_newVersion === k_currentVersion && k_newBuild > k_currentBuild),
												k_isDowngrade = (k_newVersion < k_currentVersion) || (k_newVersion === k_currentVersion && k_newBuild < k_currentBuild),
												k_infoText;

											k_form.k_tabs._k_sameAsUploadedVersion = false;

											if (k_isUpgrade) {
												k_infoText = k_tr('File was uploaded successfully. Ready to upgrade.', 'upgradeEditor');
												k_form.k_setVisible('k_startUpgrade');
												k_form.k_getItem('k_uploadInfo').k_addClassName('actionResultOk');
											}
											else if (k_isDowngrade) {
												k_infoText = k_tr('File was uploaded successfully. Ready to downgrade.', 'upgradeEditor');
												k_form.k_setVisible('k_startDowngrade');
												k_form.k_getItem('k_uploadInfo').k_addClassName('actionResultWarning');
											}
											else {
												kerio.woip.k_methods.k_alertWarn(k_tr('You are running same as uploaded version.', 'upgradeEditor'));
												k_infoText = k_tr('File was uploaded successfully. Upgrade is not necessary.', 'upgradeEditor');
												k_form.k_tabs._k_sameAsUploadedVersion = true;
												k_form.k_setVisible('k_startUpgrade');
												k_form.k_getItem('k_uploadInfo').k_addClassName('actionResultWarning');
											}

											k_form.k_setData({
													k_uploadInfo: k_infoText,
													k_upgradeCurrentVersion: k_currentVersion + ' build ' + k_currentBuild,
													k_upgradeUploadedVersion: k_newVersion + ' build ' + k_newBuild
											});

											k_form.k_setVisible(['k_upgradeCurrentVersion', 'k_upgradeUploadedVersion', 'k_uploadInfo']);
											k_form.k_setVisible('uploadFile', false);

											k_form.k_tabs._k_info = k_info;

										}
										else {
											k_form.k_setVisible(['k_startUpgrade', 'k_startDowngrade', 'k_uploadInfo', 'k_upgradeCurrentVersion', 'k_upgradeUploadedVersion'], false);
										}

									} // end of k_onUpload
								},
								{
									k_type: 'k_simpleText',
									k_id: 'k_uploadInfo',
									k_isHidden: true,
									k_isLabelHidden: true
								},
								'->'
							]
						},
						{
							k_type: 'k_display',
							k_id: 'k_upgradeCurrentVersion',
							k_caption: k_tr('Current version:', 'upgradeEditor'),
							k_isHidden: true
						},
						{
							k_type: 'k_display',
							k_id: 'k_upgradeUploadedVersion',
							k_caption: k_tr('Uploaded version:', 'upgradeEditor'),
							k_isHidden: true
						},
						{
							k_type: 'k_formButton',
							k_id: 'k_startDowngrade',
							k_caption: k_tr('Downgrade…', 'upgradeEditor'),
							k_isHidden: true,

							/**
							 * start downgrade
							 *
							 * @param k_form [object]
							 * @param k_button [object]
							 * @return [void]
							 */
							k_onClick: function(k_form, k_button) {
								k_form.k_tabs.k_showProductUpgrade(false, k_button);
							} // end of k_onClick
						},
						{
							k_type: 'k_formButton',
							k_id: 'k_startUpgrade',
							k_caption: k_tr('Upgrade…', 'upgradeEditor'),
							k_isHidden: true,

							/**
							 * start upgrade
							 *
							 * @param k_form [object]
							 * @param k_button [object]
							 * @return [void]
							 */
							k_onClick: function(k_form, k_button) {
								k_form.k_tabs.k_showProductUpgrade(true, k_button);
							} // end of k_onClick
						}
					]
				}
			]
		};
		k_formProductUpgrade = new kerio.lib.K_Form(k_localNamespace + 'k_formProductUpgrade', k_formProductUpgradeCfg);

		k_tabsCfg = {
			k_className: 'mainList mainForm',
			k_toolbars: {
				k_bottom: k_applyResetToolbar
			},

			/**
			 * monitor which tab is active
			 *
			 * @param k_tabPage [object]
			 * @param k_currentTabId [string]
			 * @return [void]
			 */
			k_onTabChange: function(k_tabPage, k_currentTabId) {

				var
					k_form;

				kerio.adm.k_framework._k_setHelpQuery('advancedOptions' + '_' + k_currentTabId);
				this.k_currentTabId = k_currentTabId;

				if ('formBackupAndRecovery' === k_currentTabId) {
					k_form = k_tabPage.k_formBackupAndRecovery;

					if (true === k_form._k_backupFileWasCreated) {
						k_form.k_tabs.k_offerDownloadBackup(); // offer download of the backup first...
						delete k_form._k_backupFileWasCreated;
					}

					if (true === k_form._k_restoreFileWasUploaded) {
						this.k_formBackupAndRecovery.k_setVisible('k_uploadedRecoveryFileInfo');
						this.k_formBackupAndRecovery.k_setDisabled('k_uploadBackupFile');
						kerio.lib.k_confirm({
								k_title: k_tr('Question', 'common'),
								k_msg: k_tr('Restore file was uploaded. Do you want to open Recovery dialog now?', 'backupAndRecoveryEditor'),
								k_icon: 'question',
								k_scope: this,
								k_defaultButton: 'yes',

								// callback
								k_callback: function(k_answer) {
									if ('yes' === k_answer) {
										kerio.lib.k_ui.k_showDialog({k_sourceName: 'recovery', k_params: {k_masterForm: this.k_formBackupAndRecovery}});
									}
								} // end of k_callback
						});
						delete k_form._k_restoreFileWasUploaded;
					}

				}

			}, // end of k_onTabChange

			k_items: [
				{
					k_caption: k_tr('General', 'systemSettings'),
					k_id: 'formGeneral',
					k_content: k_formGeneral
				},
				{
					k_caption: k_tr('Telephony', 'systemSettings'),
					k_id: 'formTelephony',
					k_content: k_formTelephony
				},
				{
					k_caption: k_tr('Login Page', 'systemSettings'),
					k_id: 'formOperatorClient',
					k_isDisabled: true,
					k_content: k_formOperatorClientLoginPage
				},
				{
					k_caption: k_tr('Backup and Recovery', 'systemSettings'),
					k_id: 'formBackupAndRecovery',
					k_isDisabled: true,
					k_content: k_formBackupAndRecovery
				}
			]
		};

		if(!kerio.woip.k_inDocker){
			k_tabsCfg.k_items.push({
					k_caption: k_tr('Update Checker', 'systemSettings'),
					k_id: 'formProductUpgrade',
					k_isDisabled: true,
					k_content: k_formProductUpgrade
				});
		}

		//Data encryption
		var k_formDataEncryptionCfg = {
			k_items: [
				{
					k_type: 'k_fieldset',
					k_caption: k_tr('Data Encryption', 'advancedOptions'),
					k_labelWidth: 240,
					k_items: [{
						k_type: 'k_container',
						k_className: 'text-cont-compact',
						k_items: [{
							k_type: 'k_display',
							k_value: k_tr('Enable Encryption to ensure that Kerio Operator will encrypt all data prior writing it to the disk.', 'advancedOptions')
						}, {
							k_type: 'k_display',
							k_value: k_tr('Please note that encryption results in more resources being utilized and hence performance could be affected.', 'advancedOptions')
						}, {
							k_type: 'k_display',
							k_value: k_tr('Encryption also locks the data to this particular device, hence change to the device hardware could result in the data being inaccessible.', 'advancedOptions')
						}]
					}, {
						k_type: 'k_display',
						k_id: 'dataEncryptWarn',
						k_isHidden: true,
						k_isSecure: true,
						k_value: {
							k_text: '',
							k_linkText: '',
							k_img: 'img-info'
						},
						k_template: '<div class="data-encrypt-warn">' +
						'<span class="data-encrypt-img {k_img}"></span>' +
						'<span class="data-encrypt-warn-text">{k_text}</span>&nbsp;' +
						'<a href="javascript:void(0)" class="data-encrypt-warn-link">{k_linkText}</a>' +
						'</div>',
						k_onLinkClick: function(k_form, k_item, k_id) {
							k_form.k_dialog.k_toggleResizeProgress(true);
						}
					}, {
						k_type: 'k_display',
						k_id: 'dataEncryptStatus',
						k_className: 'data-encrypt-status',
						k_style: 'margin-left: -5px;',
						k_isSecure: true,
						k_value: {
							k_info: ''
						},
						k_template: '<i class="icon"></i>{k_info}'
					}, {
						k_type: 'k_formButton',
						k_id: 'btnDecrypt',
						k_caption: k_tr('Disable', 'advancedOptions'),
						k_onClick: function(k_form, k_button) {
							k_form.k_dialog.k_onDecryptClick(k_form);
						}
					}, {
						k_type: 'k_text',
						k_id: 'encryptPassword',
						k_caption: k_tr('Password:', 'advancedOptions'),
						k_isPasswordField: true,
						k_width: 300,
						k_style: 'margin-left: 1px;',
						k_onChange: function(k_form, k_item) {
							k_form.k_dialog.k_onEncryptPasswordChange(k_form);
						},
						k_onBlur: function(k_form, k_item) {
						},
						k_onKeyPress: function(k_form, k_item, k_event) {
						}
					}, {
						k_type: 'k_text',
						k_id: 'encryptPasswordConfirm',
						k_caption: k_tr('Confirm password:', 'advancedOptions'),
						k_isPasswordField: true,
						k_width: 300,
						k_style: 'margin-left: 1px;',
						k_validator: {
							k_allowBlank: false
						},
						k_onChange: function(k_form, k_item) {
							k_form.k_dialog.k_onEncryptPasswordChange(k_form);
						},
						k_onBlur: function(k_form, k_item) {
						},
						k_onKeyPress: function(k_form, k_item, k_event) {
						}
					}, {
						k_type: 'k_row',
						k_id: 'btnEncryptCont',
						k_className: 'encrypt-btn-cont',
						k_items: [{
							k_type: 'k_display',
							k_isSecure: true,
							k_value: '',
							k_width: 1
						}, {
							k_type: 'k_formButton',
							k_id: 'btnEncrypt',
							k_caption: k_tr('Enable', 'advancedOptions'),
							k_onClick: function(k_form, k_button) {
								k_form.k_dialog.k_onEncryptClick(k_form);
							}
						}]
					}]
				}
			]
		};
		var k_formDataEncryption = new kerio.lib.K_Form(k_localNamespace + 'k_formDataEncryption', k_formDataEncryptionCfg);


		k_tabsCfg.k_items.push({
			k_caption: k_tr('Data Encryption', 'advancedOptions'),
			k_id: 'dataEncryption',
			k_content: k_formDataEncryption
		});
		//Data encryption end

		k_tabs = new kerio.lib.K_TabPage(k_localNamespace + 'k_tabs', k_tabsCfg);

		k_formDataEncryption.k_addReferences({
			k_dialog: k_tabs
		});

		this.k_addControllers(k_tabs);

		// save some properties for future usage
		k_tabs.k_addReferences({
				k_applyResetToolbar: k_applyResetToolbar,
				k_formGeneral: k_formGeneral,
				k_formTelephony: k_formTelephony,
				k_formBackupAndRecovery: k_formBackupAndRecovery,
				k_formProductUpgrade: k_formProductUpgrade,
				k_formOperatorClientLoginPage: k_formOperatorClientLoginPage,
				k_formDataEncryption: k_formDataEncryption,
				k_isAuditor: k_isAuditor,
				k_changedForms: {},
				_k_info: {},
				k_currentTabId: 'formGeneral'
		});
		k_formGeneral.k_addReferences({
				k_tabs: k_tabs
		});
		k_formTelephony.k_addReferences({
				k_tabs: k_tabs
		});
		k_formBackupAndRecovery.k_addReferences({
				k_tabs: k_tabs
		});
		k_formOperatorClientLoginPage.k_addReferences({
				k_tabs: k_tabs
		});
		
		if(!kerio.woip.k_inDocker){
			k_formProductUpgrade.k_addReferences({
				k_tabs: k_tabs
		});
		}

		return k_tabs;
	}, // end k_init

	/**
	 * methods
	 * (to keep the design part (View) separately from execution methods (Controllers))
	 *
	 * @param  k_kerioWidget  [kerio.Object] kerio Widget created by k_init method
	 * @return [void]
	 */
	k_addControllers: function (k_kerioWidget) {
		//flag progress dialog opened
		k_kerioWidget.isProgressDialogOpened = false;

		//flag progress dialog opened
		k_kerioWidget.isDecryptionDialogOpened = false;

		//ui state
		k_kerioWidget.encryptionUIState = kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.decrypted;

		/**
		 * this method is called when the widget is opened
		 *
		 * @param k_params [object]
		 * @return [void]
		 */
		k_kerioWidget.k_applyParams = function(k_params) {

			delete this._k_stopGetBackupStatus;

			if ('dataEncryption' === kerio.woip._k_selectTab) {
				delete kerio.woip._k_selectTab;
				this.k_setActiveTab('dataEncryption');
			}
			else {
				this.k_setActiveTab('formGeneral');
			}

			this.k_formGeneral.k_setDisabledAll();

			this._k_formsAreLoading = true;
			this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

			this.k_formGeneral.k_reset();
			this.k_formGeneral.k_setVisible('k_timeZoneChangeWarning', false);
			this.k_formTelephony.k_setVisible('k_defaultCountryChangeWarning', false);
			if (this.k_formBackupAndRecovery._k_remoteStorage) {
				this.k_formBackupAndRecovery.k_reset();
			}
			this.k_formBackupAndRecovery.k_setVisible('k_uploadedRecoveryFileInfo', false);
			this.k_formBackupAndRecovery.k_setDisabled(['k_startRemoteBackupButton', 'k_uploadBackupFile'], false);

			if(!kerio.woip.k_inDocker){
				this.k_formProductUpgrade.k_reset();
				this.k_formProductUpgrade.k_setVisible(['k_startUpgrade', 'k_startDowngrade', 'k_uploadInfo', 'k_upgradeCurrentVersion', 'k_upgradeUploadedVersion'], false);
				this.k_formProductUpgrade.k_setVisible('uploadFile');
				delete this.k_formProductUpgrade._k_showWarningOnDownloadFailure;
			}

			this._k_formsAreLoading = false; // k_enableApplyReset is called also when forms are reseted

			// force to load all forms
			this.k_changedForms = {
				k_formGeneral: true,
				k_formTelephony: true,
				k_formBackupAndRecovery: true,
				k_formProductUpgrade: false,
				k_formOperatorClientLoginPage: true
			};

			if(!kerio.woip.k_inDocker){
				this.k_changedForms.k_formProductUpgrade = true;
			}

			this._k_formsAreLoading = true; // supress enabled buttons (apply, reset) while data during loading data

			this.k_loadData();

			//get Data encryption status
			this.k_getEncryptionStatus();
		}; // end of k_kerioWidget.k_applyParams

		/**
		 * load data into the form
		 *
		 * @param [void]
		 * @return [void]
		 */
		k_kerioWidget.k_loadData = function() {

			this.k_disableTabs();

			var
				k_commandList = [];

			if (!this._k_timeZoneSelectInitialized) {
				k_commandList.push({
						method: 'SystemSettings.getTimeZones',
						params: {
							currentDate: kerio.woip.k_getCurrentDate()
						}
				});
			}

			if (this.k_changedForms.k_formGeneral) {
				k_commandList.push({
						method: 'Languages.getDefaultPbx'
				});
				k_commandList.push({
						method: 'SmtpRelay.get'
				});
				k_commandList.push({
						method: 'SystemSettings.get'
				});
				k_commandList.push({
						method: 'CentralManagement.get'
				});
				k_commandList.push({
						method: 'CentralManagement.getStatus'
				});
			}

			if (this.k_changedForms.k_formTelephony) {
				k_commandList.push({
						method: 'Server.getMaxCalls'
				});
				k_commandList.push({
						method: 'Server.getMaxVoicemailCalls'
				});
				k_commandList.push({
						method: 'Languages.getDefaultCountry'
				});
				k_commandList.push({
						method: 'Server.getUserForwardingBackground'
				});
				k_commandList.push({
						method: 'Server.getWebrtcSettings'
				});
				k_commandList.push({
						method: 'Server.getTransferSettings'
				});
				k_commandList.push({
						method: 'Server.getNumberingPlan'
				});
			}

			if (this.k_changedForms.k_formBackupAndRecovery) {
				k_commandList.push({
						method: 'SystemBackup.get'
				});
				k_commandList.push({
						method: 'SystemBackup.getManualBackupSections'
				});
				k_commandList.push({
						method: 'RemoteStorage.get'
				});
			}

			if (this.k_changedForms.k_formProductUpgrade) {
				k_commandList.push({
						method: 'UpdateChecker.get'
				});
				k_commandList.push({
						method: 'UpdateChecker.getStatus'
				});
			}

			if (this.k_changedForms.k_formOperatorClientLoginPage) {
				k_commandList.push({
						method: 'ClientSettings.get'
				});
				k_commandList.push({
						method: 'Server.getWebrtcSettings'
				});
			}

			if (k_commandList.length > 0) {
				kerio.lib.k_ajax.k_request({
						k_jsonRpc: {
							method: 'Batch.run',
							params: {
								commandList: k_commandList
							}
						},
						k_callback: this.k_callbackLoadData,
						k_callbackParams: k_commandList,
						k_scope: this
				});
			}

		}; // end of k_kerioWidget.k_loadData

		/**
		 * callback - when data are loaded from server
		 *
		 * @param k_response [Object]
		 * @param k_success [Boolean]
		 * @param k_callbackParams [object]
		 * @return [void]
		 */
		k_kerioWidget.k_callbackLoadData = function(k_response, k_success, k_callbackParams) {

			this.k_formGeneral.k_setDisabledAll(false);

			if (!k_success || !k_response.k_isOk) {
				/* display the product upgrade screen on error */
				var fallbackTab = kerio.woip.k_inDocker ? 'formBackupAndRecovery' : 'formProductUpgrade';
				this.k_setActiveTab(fallbackTab);
				this.k_disableTabs();
				this.k_setDisabledTab([fallbackTab], false);
				return;
			}

			var
				k_decoded = k_response.k_decoded,
				k_decodedItem,
				k_method,
				k_decodedI,
				k_decodedCount,
				k_form,
				k_loadedData;

			for (k_decodedI = 0, k_decodedCount = k_decoded.length; k_decodedI < k_decodedCount; k_decodedI++) {
				k_decodedItem = k_decoded[k_decodedI];
				k_method = k_callbackParams[k_decodedI].method;

				switch (k_method) {
					/* general */
					case 'SystemSettings.getTimeZones':
						this.k_formGeneral.k_getItem('k_timeZone').k_setData(k_decodedItem.timeZones);
						this._k_timeZoneSelectInitialized = true;
						break;

					case 'Server.getMaxCalls':
						this.k_formTelephony._k_maxCalls = k_decodedItem.maxCalls;
						break;

					case 'Server.getMaxVoicemailCalls':
						this.k_formTelephony._k_maxVoicemailCalls = k_decodedItem.maxVoicemailCalls;
						break;

					case 'Languages.getDefaultPbx':
						kerio.woip.k_systemLanguage = k_decodedItem.language;
						break;

					case 'Languages.getDefaultCountry':
						kerio.woip.k_formTelephony = k_decodedItem.country;
						break;

					case 'SmtpRelay.get':
						this.k_formGeneral._k_smtpRelaySettings = k_decodedItem.settings;
						this.k_formGeneral._k_smtpRelayQueueAll = k_decodedItem.queueAll;
						this.k_formGeneral._k_smtpRelayQueueFailed = k_decodedItem.queueFailed;
						break;

					case 'Server.getUserForwardingBackground':
						this.k_formTelephony._k_userCallForwardingSettings = k_decodedItem.userForwardingBackground;
						break;

					case 'Server.getTransferSettings':
						this.k_formTelephony._k_transferTimeoutEnabled = k_decodedItem.timeoutEnabled;
						this.k_formTelephony._k_transferTimeout = k_decodedItem.timeout;
						this.k_formTelephony._k_attendedTransferBeep = k_decodedItem.beep;
						break;

					case 'Server.getNumberingPlan':
						this.k_formTelephony._k_startingNumber = k_decodedItem.startingNumber;
						break;

					case 'SystemSettings.get':
						this.k_formGeneral._k_timeSettings = {
							theTime: k_decodedItem.theTime,
							ntpServer: k_decodedItem.ntpServer,
							timeZoneId: k_decodedItem.timeZoneId
						};
						break;

					case 'CentralManagement.get':
						this._k_myKerioEnabled = k_decodedItem.config.enabled;
						kerio.woip.k_updateRemoteStoragePathLink(this.k_formBackupAndRecovery);
						break;

					case 'CentralManagement.getStatus':
						this._k_myKerioConnected = k_decodedItem.status.connected;
						this._k_myKerioPaired = k_decodedItem.status.paired;
						this._k_myKerioUrl = k_decodedItem.status.backupUrl;
						this._k_myKerioUrlShort = k_decodedItem.status.backupUrlShort;
						break;

					case 'Server.getWebrtcSettings':
						this.k_formTelephony._k_webrtcEnabled = k_decodedItem.webrtcEnabled;
						this.k_formTelephony._k_useOpusCodec = k_decodedItem.useOpusCodec;
						break;

					/* backup and recovery */
					case 'SystemBackup.get':
						k_form = this.k_formBackupAndRecovery;
						if (0 === k_decodedItem.autoSettings.length) {
							k_decodedItem.autoSettings = [{
									enabled: false,
									sections: {
										SYSTEM_DATABASE: true,
										VOICE_MAIL: false,
										SYSTEM_LOG: false,
										CALL_LOG: false,
										LICENSE: false,
										RECORDED_CALLS: false,
										TFTP: false
									},
									type: k_CONST.KTS_RemoteStorageProtocolMyKerio,
									path: '',
									period: 2 * 3600 * 24,
									rotation: 7,
									startAt: 3600
							}];
						}
						k_decodedItem.autoSettings[0].k_backupContent = this.k_getBackupContentText(k_decodedItem.autoSettings[0].sections);
						k_decodedItem.autoSettings[0].period = Math.round(k_decodedItem.autoSettings[0].period / (3600 * 24)); // period is in seconds in API
						var k_startAtHours = Math.round(k_decodedItem.autoSettings[0].startAt / 3600),
							k_startAtMinutes = Math.round((k_decodedItem.autoSettings[0].startAt - (k_startAtHours * 3600)) / 60);
						k_decodedItem.autoSettings[0].startAt = kerio.woip.k_formatTime({hour: k_startAtHours, min: k_startAtMinutes});

						k_form._k_isAutomaticSetData = true;
						k_form.k_setData(k_decodedItem.autoSettings[0]);
						delete k_form._k_isAutomaticSetData;

						// call the callback of SystemBackup.get manually
						k_form._k_isAutomaticSetData = true;
						this.k_getBackupStatusCallback({k_isOk: true, k_decoded: k_decodedItem}, k_success);
						delete k_form._k_isAutomaticSetData;

						if (k_CONST.KTS_SystemBackupStateRunning === k_decodedItem.statusRestore.STATE) {
							this.k_startGetRestoreStatus();
						}

						if (
							// restore file is available now...
							(k_CONST.KTS_SystemBackupStateRestoreReady === k_decodedItem.statusRestore.STATE)
						  ) {
							k_form._k_restoreFileWasUploaded = true;
						}

						k_form.k_setVisible(['k_rowFtp'], k_decodedItem.autoSettings[0].type === k_CONST.KTS_RemoteStorageProtocolFtp);
						k_form.k_setVisible(['k_rowMyKerio'], k_decodedItem.autoSettings[0].type === k_CONST.KTS_RemoteStorageProtocolMyKerio);
						break;

					case 'SystemBackup.getManualBackupSections':
						this.k_formBackupAndRecovery._k_ManualBackupSections = k_decodedItem.manualBackupSections;
						this.k_formBackupAndRecovery._k_remoteBackupSections = k_decodedItem.remoteBackupSections;
						break;

					case 'RemoteStorage.get':
						this.k_formBackupAndRecovery._k_remoteStorage = k_decodedItem.settings;
						kerio.woip.k_updateRemoteStoragePathLink(k_form);
						break;


					/* Product Upgrade */
					case 'UpdateChecker.get':
						this.k_formProductUpgrade.k_setData(k_decodedItem.config);
						break;

					case 'UpdateChecker.getStatus':
						this.k_setUpdate({k_decoded: k_decodedItem}, false);
						break;


					/* Operator Client */
					case 'ClientSettings.get':
						this.k_formOperatorClientLoginPage.k_setData(k_decodedItem.clientOptions);
						break;
				}
			} // end of "for" cycle

			if (this.k_changedForms.k_formGeneral) {
				k_form = this.k_formGeneral;

				k_loadedData = {
					k_smtpRelay_serviceType: k_form._k_smtpRelaySettings.serviceType,
					k_smtpRelay_alertEmail: k_form._k_smtpRelaySettings.alertEmail,
					k_smtpRelay_hostname: k_form._k_smtpRelaySettings.hostname || k_tr('Not configured', 'voicemailEditor'),
					k_time: '',
					k_date: '',
					k_ntpEnabled: false,
					k_ntpHostname: '',
					k_timeZone: k_form._k_timeSettings.timeZoneId
				};

				if(!kerio.woip.k_inDocker){
					k_loadedData.k_ntpEnabled  = k_form._k_timeSettings.ntpServer.enabled,
					k_loadedData.k_ntpHostname = k_form._k_timeSettings.ntpServer.hostname;
				}

				k_form._k_originalTimeZoneId = k_form._k_timeSettings.timeZoneId;
				if (!this.k_isAuditor) {
					k_form.k_setReadOnlyAll(false);
				}
				k_form.k_setData(k_loadedData);
				k_form.k_getItem('k_smtpRelay_hostname').k_setDisabled(!k_form._k_smtpRelaySettings.hostname);

				var k_theTime = k_form._k_timeSettings.theTime;
				if (k_theTime.tm_year < 1000) {
					k_theTime.tm_year += 1900;
				}
				kerio.woip.k_serverClientDiff = new Date(k_theTime.tm_year, k_theTime.tm_mon, k_theTime.tm_mday,
					k_theTime.tm_hour, k_theTime.tm_min, k_theTime.tm_sec).getTime() - new Date().getTime();
				this.k_startAutoUpdateTimeDate();

				this.k_updateSmtpQueueStatus(k_form);

				k_form.k_setVisible(['k_myKerioEmailDisabled', 'k_myKerioEmailError', 'k_myKerioEmailOk'], false);
				if (this._k_myKerioEnabled) {
					if (this._k_myKerioConnected) {
						k_form.k_setVisible(['k_myKerioEmailOk'], true);
					}
					else {
						k_form.k_setVisible(['k_myKerioEmailError'], true);
					}
				}
				else {
					k_form.k_setVisible(['k_myKerioEmailDisabled'], true);
				}

				delete k_form.k_isPasswordEdited;

				delete this.k_changedForms.k_formGeneral;
			}

			if (this.k_changedForms.k_formTelephony) {
				k_form = this.k_formTelephony;

				if (!this._k_countrySelectInitialized) {
					k_form.k_getItem('k_systemCountry').k_setData(kerio.woip.k_getCountrySelectData(false));
					this._k_countrySelectInitialized = true;
				}

				k_form.k_getItem('k_systemLanguage').k_setData(kerio.woip.k_getLanguagePbxSelectData(false));

				k_loadedData = {
					k_systemLanguage: kerio.woip.k_systemLanguage.GUID,
					k_maxCalls: k_form._k_maxCalls,
					k_maxVoicemailCalls: k_form._k_maxVoicemailCalls,
					k_systemCountry: kerio.woip.k_systemCountry,
					k_pbxStartingNumber: k_form._k_startingNumber,
					k_userCallForwardingSettings: k_form._k_userCallForwardingSettings,
					k_transferTimeoutEnabled: k_form._k_transferTimeoutEnabled,
					k_transferTimeout: k_form._k_transferTimeout,
					k_attendedTransferBeep: k_form._k_attendedTransferBeep,
					k_useOpusCodec: k_form._k_useOpusCodec,
					k_webrtcEnabled: k_form._k_webrtcEnabled
				};

				k_form._k_originalCountry = kerio.woip.k_systemCountry;
				if (!this.k_isAuditor) {
					k_form.k_setReadOnlyAll(false);
				}
				k_form.k_setData(k_loadedData);

				delete this.k_changedForms.k_formTelephony;
			}

			if (this.k_changedForms.k_formOperatorClientLoginPage) {
				delete this.k_changedForms.k_formOperatorClientLoginPage;
			}

			if (this.k_changedForms.k_formBackupAndRecovery) {
				k_form = this.k_formBackupAndRecovery;

				k_form.k_setVisible(['k_myKerioBackupDisabled', 'k_myKerioBackupNotPaired'], false);
				if (this._k_myKerioEnabled) {
					if (! this._k_myKerioPaired || ! this._k_myKerioConnected) {
						k_form.k_setVisible(['k_myKerioBackupNotPaired'], true);
					}
				}
				else {
					k_form.k_setVisible(['k_myKerioBackupDisabled'], true);
				}
				kerio.woip.k_updateRemoteStoragePathLink(k_form);

				if (!this.k_isAuditor) {
					k_form.k_setReadOnlyAll(false);
				}

				delete this.k_changedForms.k_formBackupAndRecovery;
			} // end of backup and recovery

			if (this.k_changedForms.k_formProductUpgrade) {
				delete this.k_changedForms.k_formProductUpgrade;
			}

			var
				k_changedForm,
				k_loadingFormsAreEmpty = true;
			for (k_changedForm in this.k_changedForms) {
				if (this.k_changedForms[k_changedForm]) {
					k_loadingFormsAreEmpty = false;
				}
			}

			if (k_loadingFormsAreEmpty) {
				this._k_formsAreLoading = false;
				this.k_disableTabs(false); // enable tabs
				if (!this.k_isAuditor) {
					this.k_formGeneral.k_setReadOnlyAll(false);
				}

				if (this.k_formBackupAndRecovery._k_backupFileWasCreated && !kerio.lib.k_isIPad) {
					this.k_setActiveTab('formBackupAndRecovery');
				}

				if ('k_productUpgrade' === kerio.woip._k_selectTab) {
					delete kerio.woip._k_selectTab;
					this.k_setActiveTab('formProductUpgrade');
				}
				else if ('k_backupAndRecovery' === kerio.woip._k_selectTab) {
					delete kerio.woip._k_selectTab;
					this.k_setActiveTab('formBackupAndRecovery');
				}

			}
			else {
				/* open product upgrade on an error in the batch response */
				this.k_setActiveTab('formProductUpgrade');
				this.k_setDisabledTab(['formProductUpgrade'], false);
			}

			this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

		}; // end of k_kerioWidget.k_callbackLoadData

		/**
		 * prepare for saving data
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_saveData = function() {
			if (this.k_formGeneral.k_getItem('k_timeZoneChangeWarning').k_isVisible()) {
				kerio.lib.k_confirm({
						k_title: k_tr('Warning', 'common'),
						k_msg: k_tr('The server time zone will be changed now. You must reboot Kerio Operator to apply time zone changes. Are you sure you want to save changes and reboot Kerio Operator now?', 'timeEditor'),
						k_icon: 'warning',

						/**
						 * callback
						 */
						k_callback: function(k_answer) {
							if ('yes' === k_answer) {
								this.k_saveDataToEngine(true);
							}
						}, // end of k_callback

						k_scope: this
				});
			}
			else if (this.k_formTelephony.k_getItem('k_defaultCountryChangeWarning').k_isVisible()) {
				kerio.lib.k_confirm({
						k_title: k_tr('Confirm Action', 'wlibAlerts'),
						k_msg: k_tr('Restart of the telephony subsystem is required to apply default country changes. All active calls will be disconnected.', 'advancedOptions') + '<br>' + k_tr('Are you sure you want to restart the telephony subsystem?', 'systemHealth'),
						k_icon: 'warning',

						/**
						 * callback
						 */
						k_callback: function(k_answer) {
							if ('yes' === k_answer) {
								this.k_saveDataToEngine(false, true);
							}
						}, // end of k_callback

						k_scope: this
				});

			}
			else {
				this.k_saveDataToEngine(false);
			}
		}; // end of k_kerioWidget.k_saveData

		/**
		 * save data to server (update method)
		 *
		 * @param k_rebootServer [boolean]
		 * @param k_restartTelephony [boolean]
		 * @return [void]
		 */
		k_kerioWidget.k_saveDataToEngine = function(k_rebootServer, k_restartTelephony) {

			var
				k_commandList = [],
				k_dataBackupAndRecovery = this.k_formBackupAndRecovery.k_getData(true),
				k_detail,
				k_params,
				k_setDate,
				k_setTime,
				k_theTime,
				k_settings,
				k_requestCfg;

			this.k_savingRequests = 0;

			this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

			if (this.k_changedForms.k_formGeneral) {

				k_detail = this.k_formGeneral.k_getData(true);

				this.k_formGeneral.k_setReadOnlyAll();

				k_settings = {
					serviceType: k_detail.k_smtpRelay_serviceType,
					alertEmail: k_detail.k_smtpRelay_alertEmail
				};
				if (!this.k_formGeneral.k_isPasswordEdited) {
					delete k_settings.authPassword;
				}
				k_commandList.push({
						method: 'SmtpRelay.set',
						params: {
							settings: k_settings
						}
				});

				k_params = {
					timeZoneId: k_detail.k_timeZone,
					theTime: {},
					ntpServer: {
						enabled: false,
						hostname: ''
					}
				};

				if(!kerio.woip.k_inDocker){
					k_params[ntpServer] = {
						enabled: k_detail.k_ntpEnabled,
						hostname: k_detail.k_ntpHostname
					}
				}
				else{
					k_detail.k_ntpEnabled = false;
				}

				if (this.k_formGeneral._k_initialDateValue !== k_detail.k_date || this.k_formGeneral._k_initialTimeValue !== k_detail.k_time) {

					if (k_detail.k_date && k_detail.k_time) {

						k_setDate = new Date(k_detail.k_date * 1000);
						k_params.theTime.tm_year = k_setDate.getFullYear();
						k_params.theTime.tm_mon = k_setDate.getMonth();
						k_params.theTime.tm_mday = k_setDate.getDate();

						k_setTime = k_detail.k_time.split(':');
						k_params.theTime.tm_hour = k_setTime[0];
						k_params.theTime.tm_min = k_setTime[1];
						k_params.theTime.tm_sec = 0;

						if (!k_detail.k_ntpEnabled) {
							k_theTime = k_params.theTime;
							kerio.woip.k_serverClientDiff = new Date(k_theTime.tm_year, k_theTime.tm_mon, k_theTime.tm_mday,
								k_theTime.tm_hour, k_theTime.tm_min, k_theTime.tm_sec).getTime() - new Date().getTime();
						}

					}

				}

				k_commandList.push({
						method: 'SystemSettings.set',
						params: k_params
				});
				k_commandList.push({
						method: 'SystemTasks.reboot'
				});

				k_requestCfg = {

					k_jsonRpc: {
						method: 'Batch.run',
						params: {
							commandList: k_commandList
						}
					},
					k_callbackParams: {k_rebootServer: k_rebootServer},

					/**
					 * callback when data are saved
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @param k_callbackParams [object]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success, k_callbackParams) {
						var k_form = this.k_formGeneral;

						k_form.k_setReadOnlyAll(false);

						if (!k_success || !k_response.k_isOk) {
							kerio.woip.k_unmaskWidgetAfterCallbacks(this.k_changedForms);
							this.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
							return;
						}

						if (k_callbackParams.k_rebootServer) {
							kerio.woip.k_haltPermanentNotification();
							this.k_stopAutoUpdateTimeDate();
							kerio.lib.k_ui.k_showDialog({k_sourceName: 'waitingDialog', k_objectName: 'waitingDialogReboot'});
							delete this.k_changedForms.k_formGeneral;
							this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);
							kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);
							return;
						}

						this.k_startAutoUpdateTimeDate();

						// date/time was saved - we need to get fresh date/time from server...
						this.k_getFreshDateTimeFromServer.defer(2000, this);
						this.k_getFreshDateTimeFromServer.defer(5000, this);
						this.k_getFreshDateTimeFromServer.defer(15000, this);

						delete this.k_changedForms.k_formGeneral;
						this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

						kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);

					}, // end of k_callback

					k_scope: this

				}; // end of k_requestCfg

				if (!k_rebootServer) {
					// remove calling of "SystemTasks.reboot"
					k_requestCfg.k_jsonRpc.params.commandList.pop();
				}

				this.k_savingRequests++;
				kerio.lib.k_ajax.k_request(k_requestCfg);

			}

			if (this.k_changedForms.k_formTelephony) {

				k_detail = this.k_formTelephony.k_getData(true);

				this.k_formTelephony.k_setReadOnlyAll();

				k_commandList.push({
						method: 'Languages.setDefaultPbx',
						params: {
							languageId: k_detail.k_systemLanguage
						}
				});

				k_commandList.push({
						method: 'Server.setMaxCalls',
						params: {
							maxCalls: k_detail.k_maxCalls
						}
				});

				k_commandList.push({
						method: 'Server.setMaxVoicemailCalls',
						params: {
							maxVoicemailCalls: k_detail.k_maxVoicemailCalls
						}
				});

				k_commandList.push({
						method: 'Languages.setDefaultCountry',
						params: {
							country: k_detail.k_systemCountry
						}
				});

				k_commandList.push({
						method: 'Server.setUserForwardingBackground',
						params: {
							userForwardingBackground: k_detail.k_userCallForwardingSettings
						}
				});

				k_commandList.push({
						method: 'Server.setWebrtcSettings',
						params: {
							webrtcEnabled: k_detail.k_webrtcEnabled,
							useOpusCodec: k_detail.k_useOpusCodec
						}
				});

				k_commandList.push({
						method: 'Server.setTransferSettings',
						params: {
							timeoutEnabled: k_detail.k_transferTimeoutEnabled,
							timeout: k_detail.k_transferTimeout,
							beep: k_detail.k_attendedTransferBeep
						}
				});

				k_commandList.push({
						method: 'Server.setNumberingPlan',
						params: {
							startingNumber: k_detail.k_pbxStartingNumber
						}
				});

				k_requestCfg = {

					k_jsonRpc: {
						method: 'Batch.run',
						params: {
							commandList: k_commandList
						}
					},
					k_callbackParams: {k_rebootServer: k_rebootServer},

					k_callback: function(k_response, k_success, k_callbackParams) {
						var
							k_form = this.k_formTelephony,
							k_i, k_cnt, k_coutries, k_languages, k_defaultGuid;

						k_form.k_setReadOnlyAll(false);

						if (!k_success || !k_response.k_isOk) {
							kerio.woip.k_unmaskWidgetAfterCallbacks(this.k_changedForms);
							this.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
							return;
						}

						k_form.k_getItem('k_defaultCountryChangeWarning').k_setVisible(false);

						// update global variable
						k_languages = kerio.woip.k_languagePbxList;
						k_defaultGuid = k_form.k_getItem('k_systemLanguage').k_getValue();
						for (k_i = 0, k_cnt = k_languages.length; k_i < k_cnt; k_i++) {
							if (k_languages[k_i].GUID === k_defaultGuid) {
								kerio.woip.k_systemLanguage = k_languages[k_i];
								break;
							}
						}

						// update global variable
						k_coutries = kerio.woip.k_countryList;
						k_defaultGuid = k_form.k_getItem('k_systemCountry').k_getValue();
						for (k_i = 0, k_cnt = k_coutries.length; k_i < k_cnt; k_i++) {
							if (k_coutries[k_i] === k_defaultGuid) {
								kerio.woip.k_systemCountry = k_coutries[k_i];
								k_form._k_originalCountry = k_coutries[k_i];
								break;
							}
						}

						// update global variable
						kerio.woip.k_isWebrtcEnabled = k_form.k_getItem('k_webrtcEnabled').k_getValue();

						delete this.k_changedForms.k_formTelephony;
						this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

						kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);

					}, // end of k_callback

					k_scope: this

				}; // end of k_requestCfg

				if (true === k_restartTelephony) {
					k_requestCfg.k_jsonRpc.params.commandList.push({
							method: 'SystemTasks.restartTelephony'
					});
				}

				this.k_savingRequests++;
				kerio.lib.k_ajax.k_request(k_requestCfg);

			}

			if (this.k_changedForms.k_formBackupAndRecovery) {

				k_dataBackupAndRecovery.period = k_dataBackupAndRecovery.period * 3600 * 24; // period is in seconds in API
				k_dataBackupAndRecovery.startAt = k_dataBackupAndRecovery.startAt.split(':');
				k_dataBackupAndRecovery.startAt = parseInt(k_dataBackupAndRecovery.startAt[0], 10) * 3600 + parseInt(k_dataBackupAndRecovery.startAt[1], 10) * 60;

				k_requestCfg = {
					k_jsonRpc: {
						method: 'SystemBackup.set',
						params: {
							autoSettings: [k_dataBackupAndRecovery] // all other autoSettings configurations via API are removed...
						}
					},

					/**
					 * callback when data are saved
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success) {

						var
							k_form = this.k_formBackupAndRecovery;

						k_form.k_setReadOnlyAll(false);

						if (!k_success || !k_response.k_isOk) {
							kerio.woip.k_unmaskWidgetAfterCallbacks(this.k_changedForms);
							this.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
							return;
						}

						delete this.k_changedForms.k_formBackupAndRecovery;
						this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

						kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);

					}, // end of k_callback

					k_scope: this

				}; // end of k_requestCfg

				this.k_savingRequests++;
				kerio.lib.k_ajax.k_request(k_requestCfg);

			}

			if (this.k_changedForms.k_formOperatorClientLoginPage) {

				this.k_formOperatorClientLoginPage.k_setReadOnlyAll();

				k_requestCfg = {

					k_jsonRpc: {
						method: 'ClientSettings.set',
						params: {
							clientOptions: {
								customLoginPage: this.k_formOperatorClientLoginPage.k_getData(true).customLoginPage
							}
						}
					},
					k_callback: function(k_response, k_success) {

						this.k_formOperatorClientLoginPage.k_setReadOnlyAll(false);

						if (!k_success || !k_response.k_isOk) {
							kerio.woip.k_unmaskWidgetAfterCallbacks(this.k_changedForms);
							this.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
							return;
						}

						this.k_formOperatorClientLoginPage.k_setData({customLoginPage: {logo: {id: ''}}});
						delete this.k_changedForms.k_formOperatorClientLoginPage;
						this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

						kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);

					}, // end of k_callback

					k_scope: this

				}; // end of k_requestCfg

				this.k_savingRequests++;
				kerio.lib.k_ajax.k_request(k_requestCfg);
			}

			if (this.k_changedForms.k_formProductUpgrade) {

				this.k_formProductUpgrade.k_setReadOnlyAll();

				k_requestCfg = {

					k_jsonRpc: {
						method: 'UpdateChecker.set',
						params: {config: this.k_formProductUpgrade.k_getData(true)}
					},

					/**
					 * callback when data are saved
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success) {

						this.k_formProductUpgrade.k_setReadOnlyAll(false);

						if (!k_success || !k_response.k_isOk) {
							kerio.woip.k_unmaskWidgetAfterCallbacks(this.k_changedForms);
							this.k_applyResetToolbar.k_setDisabledApplyReset(false, false);
							return;
						}

						delete this.k_formProductUpgrade._k_showWarningOnDownloadFailure;

						delete this.k_changedForms.k_formProductUpgrade;
						this.k_applyResetToolbar.k_setDisabledApplyReset(true, true);

						kerio.woip.k_tryToLeaveCurrentScreen(--this.k_savingRequests);

					}, // end of k_callback

					k_scope: this

				}; // end of k_requestCfg

				this.k_savingRequests++;
				kerio.lib.k_ajax.k_request(k_requestCfg);

			}

		}; // end of k_saveDataToEngine

		/**
		 * Sets data about last update
		 *
		 * @param k_response [Object]
		 * @param k_failed [boolean]
		 * @return [void]
		 */
		k_kerioWidget.k_setUpdate = function(k_response, k_failed) {

			var
				k_params = k_response.k_decoded,
				k_form = this.k_formProductUpgrade,
				k_updateDownloadLink = k_form.k_getItem('k_updateDownloadLink'),
				k_lastUpdateAgo = k_form.k_getItem('k_lastUpdateAgo'),
				k_info = '',
				k_datetime,
				k_message,
				k_lastCheckTime;

			k_form.k_setDisabled(['k_updateNow'], false);
			
			if (!k_params.info) {
				if (k_failed == true) {
					k_updateDownloadLink.k_setValue(k_tr('Update check failed.', 'upgradeEditor'));
				}
			}
			else {
				//set value of last update ago
				k_params = k_params.info; //other values are important only on error
				k_lastCheckTime = k_params.lastCheckTime;
				if (0 !== k_lastCheckTime && -1 !== k_lastCheckTime) {
					k_datetime = kerio.woip.k_getDateTimeRenderer(kerio.woip.k_getDateTime(k_lastCheckTime)).k_data;
				}
				else {
					k_datetime = k_tr('Never', 'upgradeEditor');
				}
				k_lastUpdateAgo.k_setValue(k_datetime);

				k_form.k_setVisible('k_download', false);

				if (k_params.ok) {
					if (k_params.newVersion) {
						k_form.k_setVisible('k_download');
						k_message = k_params.description ?
							k_tr('A new version is available: %1', 'upgradeEditor', {k_args: [kerio.lib.k_htmlEncode(k_params.description)]}) :
							k_tr('A new version is available.', 'upgradeEditor');
						if (k_params.infoURL) {
							k_info = ' <a href="' + kerio.lib.k_htmlEncode(k_params.infoURL) + '" target="_blank">' + k_tr('More information…', 'upgradeEditor') + '</a>';
						}
						k_updateDownloadLink.k_safeSetValue(k_message + k_info);
						this.k_getDownloadStatus();
					}
					else {
						k_updateDownloadLink.k_setValue(k_tr('No new version is available.', 'upgradeEditor'));
					}
				}
				else {
					k_updateDownloadLink.k_setValue(k_tr('Update check failed.', 'upgradeEditor'));
				}
			}
		}; // end of k_kerioWidget.k_setUpdate

		/**
		 * Recieves response from Update Now request
		 *
		 * @param  k_response [Object] response and options from request
		 * @return [void]
		 */
		k_kerioWidget.k_handleUpdate = function(k_response, k_success) {
			var k_failed = !k_success || !k_response.k_isOk;
			this.k_setUpdate(k_response, k_failed);
		}; // end of k_kerioWidget.k_handleUpdate

		/**
		 * start update checker check action
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_startUpdateCheckerCheck = function() {
			if(kerio.woip.k_inDocker){
				return;
			}
			this.k_formProductUpgrade.k_setDisabled(['k_updateNow'], true);
			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'UpdateChecker.check'
					},
					k_callback: this.k_handleUpdate,
					k_scope: this
			});
		}; // end of k_kerioWidget.k_startUpdateCheckerCheck

		/**
		 * show release notes (if they are available) before upgrade/downgrade
		 *
		 * @param k_isUpgrade [boolean]
		 * @param k_button [object]
		 * @return [void]
		 */
		k_kerioWidget.k_showProductUpgrade = function(k_isUpgrade, k_button) {
			if(kerio.woip.k_inDocker){
				return;
			}
			// 1. when version or buildNumber is not available -> show confirm dialog immediately
			//    [Yes] [No] buttons
			// 2. when release notes are not available -> show confirm dialog (UpdateChecker.getReleaseNotes fails, all errors are suppressed)
			//    [Yes] [No] buttons
			// 3. otherwise show info about upgrade/downgrade with corresponding release notes
			//    [Upgrade/Downgrade Now] [Cancel] buttons

			if (!this._k_info.version || !this._k_info.buildNumber) {
				this.k_confirmUpgradeDowngrade(k_isUpgrade);
				return;
			}

			this.k_isUpgrade = k_isUpgrade;

			k_button.k_setDisabled();

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'UpdateChecker.getReleaseNotes',
						params: {
							versionString: this._k_info.versionString
						}
					},
					k_callbackParams: {
						k_button: k_button
					},

					/**
					 * handle all exceptions
					 */
					k_onError: function() {
						return true; // suppress all internal error messages and also invalid session
					}, // end of k_onError

					/**
					 * callback
					 */
					k_callback: function(k_response, k_success, k_callbackParams) {

						var
							k_decoded;

						k_callbackParams.k_button.k_setDisabled(false);

						if (!k_success || !k_response.k_isOk) {
							this.k_confirmUpgradeDowngrade(this.k_isUpgrade);
							return;
						}

						k_decoded = k_response.k_decoded;

						if ('' === k_decoded.releaseNotes && '' === k_decoded.changelog) {
							this.k_confirmUpgradeDowngrade(this.k_isUpgrade);
							return;
						}

						kerio.lib.k_ui.k_showDialog({k_sourceName: 'productUpgrade', k_params: {k_isUpgrade: this.k_isUpgrade, k_scope: this, k_releaseNotes: k_decoded.releaseNotes, k_changelog: k_decoded.changelog}});

					}, // end of k_callback

					k_scope: this
			});

		}; // end of k_kerioWidget.k_showProductUpgrade

		/**
		 * get upgrade/downgrade text
		 *
		 * @param k_isUpgrade [boolean]
		 * @param k_info [object]
		 * @return [string]
		 */
		k_kerioWidget.k_getUpgradeDowngradeText = function(k_isUpgrade, k_info) {
			if (k_isUpgrade) {
				if (k_info.version && k_info.buildNumber) {
					return k_tr('Do you want to upgrade to Kerio Operator version %1 (build %2) now?', 'upgradeEditor', {k_args: [k_info.version, k_info.buildNumber]});
				}
				else {
					return k_tr('Do you want to upgrade to a new version now?', 'upgradeEditor');
				}
			}
			else {
				return k_tr('Do you want to downgrade to Kerio Operator version %1 (build %2) now?', 'upgradeEditor', {k_args: [k_info.version, k_info.buildNumber]});
			}
		}; // end of k_kerioWidget.k_getUpgradeDowngradeText

		/**
		 * confirm dialog about upgrade/downgrade - used when productUpgrade dialog is not used
		 *
		 * @param k_isUpgrade [boolean]
		 * @return [void]
		 */
		k_kerioWidget.k_confirmUpgradeDowngrade = function(k_isUpgrade) {
			
			if(kerio.woip.k_inDocker){
				return;
			}

			var
				k_form = this.k_formProductUpgrade;

			k_form._k_textInfo = k_isUpgrade ? k_tr('Please wait, upgrade is in progress…', 'upgradeEditor') : k_tr('Please wait, downgrade is in progress…', 'upgradeEditor');
			k_form._k_isUpgrade = k_isUpgrade;

			kerio.lib.k_confirm({
					k_icon: k_isUpgrade ? 'question' : 'warning',
					k_title: k_isUpgrade ? k_tr('Question', 'common') : k_tr('Warning', 'common'),
					k_msg: this.k_getUpgradeDowngradeText(k_isUpgrade, k_form.k_tabs._k_info) + '<br>' + k_tr('This operation will require a restart of the server.', 'upgradeEditor'),

					/**
					 * confirm callback
					 *
					 * @param k_button [string]
					 * @return [void]
					 */
					k_callback: function(k_button) {

						if (k_button !== 'yes') {
							return;
						}

						this.k_startUpgradeDowngrade(this.k_formProductUpgrade._k_isUpgrade);

					}, // end of callback

					k_scope: this
			}); // end of k_confirm

		}; // end of k_kerioWidget.k_confirmUpgradeDowngrade

		/**
		 * start upgrade/downgrade
		 *
		 * @param k_isUpgrade [boolean]
		 * @return [void]
		 */
		k_kerioWidget.k_startUpgradeDowngrade = function(k_isUpgrade) {

			if(kerio.woip.k_inDocker){
				return;
			}

			kerio.woip.k_haltPermanentNotification();

			this.k_stopAutoUpdateTimeDate();

			// show "progress bar" as soon as possible
			this.k_formProductUpgrade._k_textInfo = k_isUpgrade ? k_tr('Please wait, upgrade is in progress…', 'upgradeEditor') : k_tr('Please wait, downgrade is in progress…', 'upgradeEditor');
			this.k_formProductUpgrade._k_isUpgrade = k_isUpgrade;
			kerio.lib.k_ui.k_showDialog({k_sourceName: 'restartProgressBar', k_objectName: 'restartProgressBarUpgrade', k_params: {k_masterForm: this.k_formProductUpgrade}});

			this.k_formProductUpgrade.k_setVisible(['k_startUpgrade', 'k_startDowngrade', 'k_uploadInfo', 'k_upgradeCurrentVersion', 'k_upgradeUploadedVersion', 'k_upgradeStart'], false);
			this.k_formProductUpgrade.k_setVisible('uploadFile');

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: (true === this._k_info.k_upgradeFromDownloadFile) ? 'UpdateChecker.performUpgrade' : 'UpdateChecker.performCustomUpgrade'
					},
					k_timeout: k_CONST.k_LONG_AJAX_TIMEOUT,
					k_scope: this,

					/**
					 * on error handler
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [boolean]
					 */
					k_onError: function(k_response, k_success) {
						return true; // suppress all internal error messages
					}, // end of k_onError

					/**
					 * startUpgrade callback
					 *
					 * @param k_response [object]
					 * @param k_success [boolean]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success) {

						if (!k_success || !k_response.k_isOk) {

							this.k_formProductUpgrade.k_setVisible('k_upgradeInfo', false);

							//TODO check for errors
							if (k_response.k_decoded.data && k_response.k_decoded.data.messageParameters) {
								// this server message always contains positional parameters
								kerio.woip.k_methods.k_alertError(k_tr(k_response.k_decoded.message,
									'serverMessage', {k_args: k_response.k_decoded.data.messageParameters.positionalParameters}));
							}
							else {
								// workaround - bug 56704
								kerio.woip.k_methods.k_alertError(k_tr(k_response.k_decoded.message, 'serverMessage', {k_args: ''}));
							}

							this.k_hideRestartProgressBarUpgrade();
							return;
						}

						this.k_startGetUpgradeStatus();

					} // end of k_callback
			}); // end of kerio.lib.k_ajax.k_request

		}; // end of k_kerioWidget.k_startUpgradeDowngrade

		/**
		 * Starts the "getUpgradeStatus" task runner.
		 *
		 * @param [void]
		 * @return [void]
		 */
		k_kerioWidget.k_startGetUpgradeStatus = function() {

			var
				k_taskRunner = kerio.woip.k_taskRunner;

			if (!k_taskRunner.k_isDefined('k_autoUpdateTaskUpgrade')) {
				k_taskRunner.k_add({
						k_id: 'k_autoUpdateTaskUpgrade',
						k_run: this.k_getUpgradeStatus,
						k_scope: this,
						k_interval: 3000
				});
			}

			k_taskRunner.k_start('k_autoUpdateTaskUpgrade');

			this._k_wasUpgradeFinished = false;

		}; // end of k_kerioWidget.k_startGetUpgradeStatus

		/**
		 * Gets upgrade status.
		 *
		 * @param [void]
		 * @return [void]
		 */
		k_kerioWidget.k_getUpgradeStatus = function() {
			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'UpdateChecker.getUpgradeStatus'
					},

					/**
					 * on error handler
					 *
					 * @param k_response [object]
					 * @param k_success [boolean]
					 * @return [boolean] true to suppress error message on client
					 */
					k_onError: function(k_response, k_success) {
						// disable the "server is not responding" message
						return true;
					}, // end of k_onError

					/**
					 * show status of upgrade (progress bar)
					 *
					 * @param k_response [object]
					 * @param k_success [boolean]
					 */
					k_callback: function(k_response, k_success) {

						// special handling of downgraded system - session is in other cookie names (see bug 47029 comment 46)
						// Note: this should be useful also when session expires from any reason - application is reloaded and should go to login
						if (k_response.k_decoded && -32001 === k_response.k_decoded.code) {
							this.k_reloadApplication(false);
						} // end of special handling

						if (!k_success || !k_response.k_isOk) {
							return;
						}

						var
							k_woip = kerio.woip,
							k_decoded = k_response.k_decoded,
							k_progress = k_decoded.progress,
							k_newBuildVersion = k_decoded.version,
							k_uploadedBuild = this._k_info.buildNumber,
							k_uploadedVersion = this._k_info.version,
							k_restartDialogForm = this._k_restartDialogForm;

						// override the progress to 100%, when the current buildVersion (constant from engine) is same as uploaded buildVersion
						if (!this._k_sameAsUploadedVersion &&
						    k_woip.k_getProductVersion(k_newBuildVersion) === k_uploadedVersion &&
						    k_woip.k_getProductBuild(k_newBuildVersion) === k_uploadedBuild) {
							k_progress = 100;
						}

						if (-1 === k_progress) {
							k_woip.k_methods.k_alertError(
								k_tr('An error occurred during the upgrade. See error log for details.', 'upgradeEditor'),
								function() {
									window.location.reload(true);
								}
							);
							if (k_woip.k_taskRunner.k_isDefined('k_autoUpdateTaskUpgrade')) {
								k_woip.k_taskRunner.k_stop('k_autoUpdateTaskUpgrade');
							}
							return;
						}

						if (k_progress >= 40 && k_progress < 100) {
							this._k_restartDialogForm.k_setData({
									k_upgradeInfo: k_tr('Waiting for server restart…', 'upgradeEditor')
							});
						}

						if (100 === k_decoded.progress) {

							if (k_woip.k_taskRunner.k_isDefined('k_autoUpdateTaskUpgrade')) {
								k_woip.k_taskRunner.k_stop('k_autoUpdateTaskUpgrade');
							}

							if (this._k_wasUpgradeFinished) {
								return;
							}

							this._k_wasUpgradeFinished = true;

							this._k_restartDialogForm.k_setData({
									k_upgradeInfo: k_tr('Reloading…', 'upgradeEditor')
							});

							window.location = window.location.href.split('#')[0] + '#currentVersion-' + k_uploadedVersion + '.' + k_uploadedBuild;
							window.location.reload(true);

						}
					}, // end of k_callback

					k_scope: this
			}); // end of kerio.lib.k_ajax.k_request
		}; // end of k_kerioWidget.k_getUpgradeStatus

		/**
		 * Starts the "getRestoreStatus" task runner.
		 *
		 * @param [void]
		 * @return [void]
		 */
		k_kerioWidget.k_startGetRestoreStatus = function() {

			var
				k_taskRunner = kerio.woip.k_taskRunner;

			this.k_formBackupAndRecovery.k_setDisabled('k_uploadBackupFile', false);

			this.k_stopAutoUpdateTimeDate();

			kerio.lib.k_ui.k_showDialog({k_sourceName: 'recoveryProgress', k_objectName: 'recoveryProgressDialog', k_params: {k_masterForm: this.k_formBackupAndRecovery}});

			if (!k_taskRunner.k_isDefined('k_autoUpdateTaskRestore')) {
				k_taskRunner.k_add({
						k_id: 'k_autoUpdateTaskRestore',
						k_run: this.k_getRestoreStatus,
						k_scope: this,
						k_interval: 5000
				});
			}

			k_taskRunner.k_start('k_autoUpdateTaskRestore');

			this._k_wasRestoreFinished = false;

		}; // end of k_kerioWidget.k_startGetRestoreStatus

		/**
		 * reload the application - go to login screen
		 *
		 * @param k_isRestore [boolean] (default true)
		 * @return [void]
		 */
		k_kerioWidget.k_reloadApplication = function(k_isRestore) {

			var
				k_caption;

			k_caption = (false === k_isRestore) ?
				k_tr('Your system has been upgraded. Please login to administration to check your configuration.', 'upgradeEditor') :
				k_tr('Your system has been recovered. Please login to administration to check your configuration.', 'recoveryDialog');

			if (kerio.woip.k_taskRunner.k_isDefined('k_autoUpdateTaskUpgrade')) {
				kerio.woip.k_taskRunner.k_stop('k_autoUpdateTaskUpgrade');
			}
			if (kerio.woip.k_taskRunner.k_isDefined('k_autoUpdateTaskRestore')) {
				kerio.woip.k_taskRunner.k_stop('k_autoUpdateTaskRestore');
			}

			if (this._k_wasRestoreFinished) {
				return;
			}

			this._k_wasRestoreFinished = true;

			kerio.woip.k_methods.k_alertInfo(
				k_caption,

				/**
				 * callback
				 *
				 * @return [void]
				 */
				function() {
					window.location = window.location.href.split('#')[0] + '#language-' + kerio.woip.k_realLanguage;
					window.location.reload(true);
				}, // end of callback
				this
			); // end of kerio.woip.k_methods.k_alertInfo

		}; // end of k_kerioWidget.k_reloadApplication

		/**
		 * Gets restore status.
		 *
		 * @param [void]
		 * @return [void]
		 */
		k_kerioWidget.k_getRestoreStatus = function() {

			if (!this._k_restoreStatusCounter) {
				this._k_restoreStatusCounter = 1;
			}
			else {
				this._k_restoreStatusCounter++;
			}

			// bug 51137 recovery over https is not completed (when ssl certificate is recovered = changed)
			// 96 * 5 seconds => 8 minutes
			if (kerio.woip.k_userInfo.IS_HTTPS_CONNECTION_USED && this._k_restoreStatusCounter > 96) {
				if (kerio.woip.k_taskRunner.k_isDefined('k_autoUpdateTaskRestore')) {
					kerio.woip.k_taskRunner.k_stop('k_autoUpdateTaskRestore');
				}
				kerio.woip.k_methods.k_alertWarn(
					k_tr('The SSL certificate has probably been changed. Please restart your browser and connect to Kerio Operator again.', 'recoveryDialog') +
					'<br><br>' +
					k_tr('Your system has been recovered. Please login to administration to check your configuration.', 'recoveryDialog'),

					/**
					 * callback - reload current URL
					 */
					function() {
						window.location.reload(true);
					} // end of callback

				); // end of kerio.woip.k_methods.k_alertWarn
				return;
			}

			kerio.lib.k_ajax.k_request({
					k_timeout: k_CONST.k_LONG_AJAX_TIMEOUT,
					k_jsonRpc: {
						method: 'SystemBackup.get'
					},

					/**
					 * on error handler
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [boolean]
					 */
					k_onError: function(k_response, k_success) {
						return true; // suppress all internal error messages and also invalid session
					}, // end of k_onError

					/**
					 * show status of restore (progress bar)
					 *
					 * @param k_response [object]
					 * @param k_success [boolean]
					 */
					k_callback: function(k_response, k_success) {

						// special handling of restored system

						if (k_response.k_decoded && -32002 === k_response.k_decoded.code) {
							// "server is not responding"
							// do nothing, engine is "restoring" (webserver is not running) or server is restarting
							return;
						}

						if (k_response.k_decoded && -32001 === k_response.k_decoded.code) {
							// "session was expired"
							// reload application - server is restored (session is in this case always cleared)
							this.k_reloadApplication();
							return;
						}

						// end of special handling

						if (!k_success || !k_response.k_isOk) {
							this.k_formBackupAndRecovery.k_setDisabled('k_uploadBackupFile', false);
							return;
						}

						// normal handling to catch possible errors during restore

						var k_status = k_response.k_decoded.statusRestore;

						if (k_status.ERROR) {
							kerio.woip.k_methods.k_alertError(k_tr(k_status.ERROR_MESSAGE,
									'serverMessage'),
								function() {
									window.location = window.location.href.split('#')[0] + '#language-' + kerio.woip.k_realLanguage;
									window.location.reload(true);
								},
								this
							);
							this.k_formBackupAndRecovery.k_setDisabled('k_uploadBackupFile', false);
							if (kerio.woip.k_taskRunner.k_isDefined('k_autoUpdateTaskRestore')) {
								kerio.woip.k_taskRunner.k_stop('k_autoUpdateTaskRestore');
								kerio.woip.k_taskRunner.k_remove('k_autoUpdateTaskRestore');
							}
							kerio.adm.k_framework._k_uiCacheManager._k_uiCache.recoveryProgress.recoveryProgressDialog.k_hide();
							return;
						}

					}, // end of k_callback

					k_scope: this,
					k_requestOwner: null
			}); // end of kerio.lib.k_ajax.k_request

		}; // end of k_kerioWidget.k_getRestoreStatus

		/**
		 * disable/enable tabs in the screen (except the active one)
		 *
		 * Note: bug 45692 Apply/Reset buttons are disabled in some situations
		 *
		 * @param k_disable [boolean] (optional, default true)
		 * @return [void]
		 */
		k_kerioWidget.k_disableTabs = function(k_disable) {

			var
				k_allTabs = ['formGeneral', 'formBackupAndRecovery', 'formProductUpgrade', 'formOperatorClient'];

			k_allTabs.remove(this.k_currentTabId);

			this.k_setDisabledTab(k_allTabs, k_disable);

		}; // end of k_kerioWidget.k_disableTabs

		/**
		 * hide restartProgressBarUpgrade dialog
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_hideRestartProgressBarUpgrade = function() {

			var
				k_upgradeProgressBar = kerio.adm.k_framework._k_uiCacheManager.k_get('restartProgressBar');

			if (!k_upgradeProgressBar) {
				this.k_hideRestartProgressBarUpgrade.defer(100, this);
				return;
			}

			k_upgradeProgressBar.restartProgressBarUpgrade.k_hide();

		}; // end of k_kerioWidget.k_hideRestartProgressBarUpgrade

		/**
		 * start download status
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_startDownloadStatus = function() {

			var
				k_taskRunner = kerio.woip.k_taskRunner;

			this.k_formProductUpgrade.k_setVisible('k_downloadStatus');

			if (!k_taskRunner.k_isDefined('k_autoUpdateDownloadStatus')) {
				k_taskRunner.k_add({
						k_id: 'k_autoUpdateDownloadStatus',
						k_run: this.k_getDownloadStatus,
						k_scope: this,
						k_interval: 1000
				});
			}

			k_taskRunner.k_start('k_autoUpdateDownloadStatus');

		}; // end of k_kerioWidget.k_startDownloadStatus

		/**
		 * cancel download of upgrade image
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_cancelDownloadStatus = function() {

			var
				k_form = this.k_formProductUpgrade,
				k_downloadStatusText = k_form.k_getItem('k_downloadStatusText');

			k_form.k_setVisible('k_downloadStatus', false);
			k_form.k_setReadOnly('k_downloadStatus', false);
			k_form.k_setDisabled('k_download', false);
			k_downloadStatusText.k_removeClassName('inProgress');
			k_downloadStatusText.k_setValue(k_tr('Download in progress:', 'upgradeEditor'));
			delete k_form._k_showWarningOnDownloadFailure;

		}; // end of k_kerioWidget.k_cancelDownloadStatus

		/**
		 * get download status
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_getDownloadStatus = function() {
			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'UpdateChecker.getDownloadStatus'
					},
					k_scope: this,

					/**
					 * callback
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success) {

						var
							k_taskRunner = kerio.woip.k_taskRunner,
							k_formProductUpgrade = this.k_formProductUpgrade,
							k_downloadStatusText = k_formProductUpgrade.k_getItem('k_downloadStatusText'),
							k_downloadProgress = k_formProductUpgrade.k_getItem('k_downloadProgress'),
							k_progress;

						if (!k_success || !k_response.k_isOk) {
							return;
						}

						k_progress = k_response.k_decoded.progress;

						k_downloadStatusText.k_removeClassName('inProgress');
						k_downloadStatusText.k_setValue(k_tr('Download in progress:', 'upgradeEditor'));

						if (99 === k_progress) {
							k_downloadProgress.k_setValue(100);
							k_downloadStatusText.k_addClassName('inProgress');
							k_downloadStatusText.k_setValue(k_tr('Checking downloaded file…', 'upgradeEditor'));
						}
						else if (100 === k_progress) {
							k_downloadProgress.k_setValue(100);
							if (k_taskRunner.k_isDefined('k_autoUpdateDownloadStatus')) {
								k_taskRunner.k_stop('k_autoUpdateDownloadStatus');
							}
							k_formProductUpgrade.k_setVisible('k_downloadStatus', false);
							k_formProductUpgrade.k_setVisible('k_upgradeStart');
							k_formProductUpgrade.k_setDisabled('k_download');
							this._k_info = k_response.k_decoded.info;
						}
						else if (-1 === k_progress) {
							if (k_formProductUpgrade._k_showWarningOnDownloadFailure) {
								kerio.woip.k_methods.k_alertWarn(k_tr('Download of the new version failed. See warning log for details.', 'upgradeEditor'));
								delete k_formProductUpgrade._k_showWarningOnDownloadFailure;
							}
							if (k_taskRunner.k_isDefined('k_autoUpdateDownloadStatus')) {
								k_taskRunner.k_stop('k_autoUpdateDownloadStatus');
							}
							k_formProductUpgrade.k_setVisible(['k_upgradeStart', 'k_downloadStatus'], false);
							k_formProductUpgrade.k_setDisabled('k_download', false);
						}
						else {
							k_downloadProgress.k_setValue(k_progress);
						}

					} // end of k_callback
			});
		}; // end of k_kerioWidget.k_getDownloadStatus

		/**
		 * start auto update of current date and time field
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_startAutoUpdateTimeDate = function() {

			var
				k_taskRunner = kerio.woip.k_taskRunner;

			if (!k_taskRunner.k_isDefined('k_autoUpdateDateTime')) {
				k_taskRunner.k_add({
						k_id: 'k_autoUpdateDateTime',
						k_run: this.k_updateDateTime,
						k_scope: this,
						k_interval: 1000
				});
			}

			k_taskRunner.k_start('k_autoUpdateDateTime');

		}; // end of k_kerioWidget.k_startAutoUpdateTimeDate

		/**
		 * stop auto update of current date and time field
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_stopAutoUpdateTimeDate = function() {

			var
				k_taskRunner = kerio.woip.k_taskRunner;

			if (k_taskRunner.k_isDefined('k_autoUpdateDateTime')) {
				k_taskRunner.k_stop('k_autoUpdateDateTime');
			}

		}; // end of k_kerioWidget.k_stopAutoUpdateTimeDate

		/**
		 * updates date and time field
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_updateDateTime = function() {

			var
				k_unixTimestamp = Math.round((new Date().getTime() + kerio.woip.k_serverClientDiff) / 1000);

			if (undefined === this.k_formGeneral._k_counter) {
				this.k_formGeneral._k_counter = 0;
			}
			this.k_formGeneral._k_counter++;

			this.k_formGeneral.k_setData({
				k_currentDateTime: kerio.adm.k_framework.k_formatDate(k_unixTimestamp) + ' ' + kerio.woip.k_formatTime(k_unixTimestamp, true)
			});

			// each two minutes refresh date and time from server
			if (0 === this.k_formGeneral._k_counter % 120) {
				this.k_getFreshDateTimeFromServer();
			}

		}; // end of k_kerioWidget.k_updateDateTime

		/**
		 * get fresh date and time from server
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_getFreshDateTimeFromServer = function() {

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemSettings.get'
					},

					k_onError: function(k_response, k_success) {
						// disable the "server is not responding" message
						return true;
					}, // end of k_onError

					/**
					 * callback when data are saved
					 *
					 * @param k_response [Object]
					 * @param k_success [Boolean]
					 * @return [void]
					 */
					k_callback: function(k_response, k_success) {

						if (!k_success || !k_response.k_isOk) {
							return;
						}

						var
							k_theTime = k_response.k_decoded.theTime;

						kerio.woip.k_serverClientDiff = new Date(k_theTime.tm_year, k_theTime.tm_mon, k_theTime.tm_mday,
							k_theTime.tm_hour, k_theTime.tm_min, k_theTime.tm_sec).getTime() - new Date().getTime();

						this.k_formGeneral._k_wasAutoChange = true;
						this.k_formGeneral.k_setData({
								k_time: '',
								k_date: ''
						});

					}, // end of k_callback

					k_scope: this
			});

		}; // end of k_kerioWidget.k_getFreshDateTimeFromServer

		/**
		 * start local/manual backup now
		 *
		 * @param k_sections [object]
		 * @return [void]
		 */
		k_kerioWidget.k_startManualBackup = function(k_sections) {

			this.k_formBackupAndRecovery.k_setDisabled('k_startLocalBackupButton');
			this.k_formBackupAndRecovery.k_setVisible('k_localBackupInfo');
			this.k_formBackupAndRecovery.k_getItem('k_localBackupInfo').k_setValue(k_tr('Please wait, backup file is preparing…', 'backupProgressDialog'));

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.backupStart',
						params: {
							sections: k_sections
						}
					},
					k_callback: this.k_startManualBackupCallback,
					k_scope: this
			});

		}; // end of k_kerioWidget.k_startManualBackup

		/**
		 * callback
		 */
		k_kerioWidget.k_startManualBackupCallback = function(k_response, k_success) {

			if (!k_success || !k_response.k_isOk) {
				this.k_formBackupAndRecovery.k_setDisabled('k_startLocalBackupButton', false);
				this.k_formBackupAndRecovery.k_setVisible('k_localBackupInfo', false);
				return;
			}

			this.k_getBackupStatus.defer(1000, this);

		}; // end of k_kerioWidget.k_startManualBackupCallback

		/**
		 * start remote backup now
		 *
		 * @param k_sections [object]
		 * @return [void]
		 */
		k_kerioWidget.k_startRemoteBackup = function(k_sections) {

			var
				k_data = this.k_formBackupAndRecovery.k_getData(true);

			this.k_formBackupAndRecovery.k_setDisabled('k_startRemoteBackupButton');
			this.k_formBackupAndRecovery.k_getItem('k_status').k_setValue(k_tr('Started now…', 'backupAndRecoveryEditor'));

			k_data.sections = k_sections;
			delete k_data.startAt;
			delete k_data.period;
			delete k_data.enabled;
			delete k_data.k_status;

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.backupStartAuto',
						params: {
							autoSettings: k_data
						}
					},
					k_callback: this.k_startRemoteBackupCallback,
					k_scope: this
			});
		}; // end of k_kerioWidget.k_startRemoteBackup

		/**
		 * callback
		 */
		k_kerioWidget.k_startRemoteBackupCallback = function(k_response, k_success) {

			if (!k_success || !k_response.k_isOk) {
				this.k_formBackupAndRecovery.k_setDisabled('k_startRemoteBackupButton', false);
				this.k_formBackupAndRecovery.k_getItem('k_status').k_setValue('');
				return;
			}

			this.k_getBackupStatus.defer(1000, this);

		}; // end of k_kerioWidget.k_startRemoteBackupCallback

		/**
		 * get remote backup status
		 */
		k_kerioWidget.k_getBackupStatus = function() {

			if (this._k_stopGetBackupStatus) {
				delete this._k_stopGetBackupStatus;
				return;
			}

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.get'
					},
					k_callback: this.k_getBackupStatusCallback,
					k_scope: this
			});

		}; // end of k_kerioWidget.k_getBackupStatus

		/**
		 * get backup status callback
		 */
		k_kerioWidget.k_getBackupStatusCallback = function(k_response, k_success) {

			var
				k_runAgain = false,
				k_form = this.k_formBackupAndRecovery,
				k_isRemoteBackupRunning = false,
				k_statusField,
				k_status,
				k_statusValue,
				k_unixTimestamp;

			if (!k_success || !k_response.k_isOk) {
				this.k_getBackupStatus.defer(5000, this);
				return;
			}

			// remote backup

			k_status = k_response.k_decoded.statusBackupAuto;
			k_statusField = k_form.k_getItem('k_status');

			if (k_CONST.KTS_SystemBackupStateIdle === k_status.STATE) {
				k_statusValue = k_tr('No backup has been performed yet.', 'backupAndRecoveryEditor'); // the default value of this state
				if (k_status.TIMESTAMP) {
					k_unixTimestamp = Math.round((k_status.TIMESTAMP * 1000 + kerio.woip.k_serverClientDiff) / 1000);
					k_statusValue = kerio.adm.k_framework.k_formatDate(k_unixTimestamp) + ' ' + kerio.woip.k_formatTime(k_unixTimestamp, true);
					if (k_status.ERROR && this._k_wasCancelled !== true) {
						k_statusValue += ' &nbsp; ' + kerio.woip.k_getImageGridCell('warning') + ' ' + kerio.lib.k_htmlEncode(k_tr(k_status.ERROR_MESSAGE,
							'serverMessage'));
					}
					else {
						// update the path only when it is specified (e.g. the path was cleared when started manual backup without configured autoSettings)
						if (k_response.k_decoded.autoSettings && k_response.k_decoded.autoSettings[0] && k_response.k_decoded.autoSettings[0].path) {
							k_form.k_getItem('path').k_setValue(k_response.k_decoded.autoSettings[0].path);
						}
						kerio.woip.k_updateRemoteStoragePathLink(k_form);
					}
				}
				k_statusField.k_setValue(k_statusValue);
				k_form.k_setDisabled('k_startRemoteBackupButton', false);
			}
			else if (k_CONST.KTS_SystemBackupStateRunning === k_status.STATE || k_CONST.KTS_SystemBackupStateUploading === k_status.STATE) {
				k_runAgain = true;
				k_isRemoteBackupRunning = true;
				k_status.PROGRESS_CURRENT = -1 === k_status.PROGRESS_CURRENT ? 0 : k_status.PROGRESS_CURRENT;
				k_statusValue = k_CONST.KTS_SystemBackupStateRunning === k_status.STATE ? k_tr('Backup is running…', 'backupAndRecoveryEditor') : k_tr('Backup is uploading…', 'backupAndRecoveryEditor');
				k_statusValue += ' <a id="k_backupCancel">' + k_tr('Cancel', 'wlibButtons') + '</a>';
				if (k_CONST.KTS_SystemBackupStateUploading === k_status.STATE) {
					k_statusValue += ' (' + k_tr('%1 out of %2', 'activeConferenceList', {k_args: [kerio.woip.k_roundDiskSize(k_status.PROGRESS_CURRENT, k_SHARED_CONST.kerio_web_KiloBytes), kerio.woip.k_roundDiskSize(k_status.PROGRESS_MAX, k_SHARED_CONST.kerio_web_KiloBytes)]}) + ')';
				}
				else {
					k_statusValue += ' (' + kerio.woip.k_roundDiskSize(k_status.PROGRESS_CURRENT, k_SHARED_CONST.kerio_web_KiloBytes) + '…)';
				}
				k_statusField.k_setValue(k_statusValue);
			}

			// local backup

			k_status = k_response.k_decoded.statusBackup;
			k_statusField = k_form.k_getItem('k_localBackupInfo');

			if (k_CONST.KTS_SystemBackupStateIdle === k_status.STATE) {
				k_form.k_setDisabled('k_startLocalBackupButton', false);
				k_form.k_setVisible('k_localBackupInfo', false);
				if (!k_form._k_isAutomaticSetData && k_status.TIMESTAMP && k_status.ERROR && false === k_isRemoteBackupRunning && this._k_wasCancelled !== true) {
					kerio.woip.k_methods.k_alertError(k_tr(k_status.ERROR_MESSAGE,
							'serverMessage'));
				}
			}
			else if (k_CONST.KTS_SystemBackupStateDownloadAvailable === k_status.STATE) {
				k_form._k_backupFileWasCreated = true;
				k_form.k_setDisabled('k_startLocalBackupButton');
				k_form.k_setVisible('k_localBackupInfo');
				k_statusValue = k_tr('Backup was successfully created.', 'backupProgressDialog');
				k_statusValue += ' (' + kerio.woip.k_roundDiskSize(k_status.PROGRESS_CURRENT, k_SHARED_CONST.kerio_web_KiloBytes) + ')';
				k_form.k_getItem('k_localBackupInfo').k_setValue(k_statusValue);
				this.k_offerDownloadBackup();
				delete k_form._k_backupFileWasCreated;
			}
			else if (k_CONST.KTS_SystemBackupStateRunning === k_status.STATE) {
				k_runAgain = true;
				k_status.PROGRESS_CURRENT = -1 === k_status.PROGRESS_CURRENT ? 0 : k_status.PROGRESS_CURRENT;
				k_statusValue = k_tr('Backup is running…', 'backupAndRecoveryEditor');
				k_statusValue += ' <a id="k_backupCancel">' + k_tr('Cancel', 'wlibButtons') + '</a>';
				k_statusValue += ' (' + kerio.woip.k_roundDiskSize(k_status.PROGRESS_CURRENT, k_SHARED_CONST.kerio_web_KiloBytes) + '…)';
				k_statusField.k_setVisible();
				k_statusField.k_setValue(k_statusValue);
			}

			if (true === this._k_wasCancelled) {
				delete this._k_wasCancelled;
			}

			if (k_runAgain) {
				this.k_getBackupStatus.defer(1000, this);
			}

		}; // end of k_kerioWidget.k_getBackupStatusCallback

		/**
		 * get backup content text
		 *
		 * @param k_sections [object]
		 * @return [string]
		 */
		k_kerioWidget.k_getBackupContentText = function(k_sections) {

			var
				k_array = [],
				k_allSectionsCount = 0,
				k_section;

			for (k_section in k_sections) {
				if (k_sections[k_section] !== undefined) {
					if (true === k_sections[k_section]) {
						k_array.push(kerio.woip.k_getSectionText(k_section));
					}
					k_allSectionsCount++;
				}
			}

			return k_allSectionsCount === k_array.length ? k_tr('Full backup', 'backupAndRecoveryEditor') : k_array.join(', ');

		}; // end of k_kerioWidget.k_getBackupContentText

		/**
		 * get selected sections count
		 *
		 * @param k_sections [object]
		 * @return [number]
		 */
		k_kerioWidget.k_getSelectedSectionsCount = function(k_sections) {

			var
				k_selectedSectionsCount = 0,
				k_section;

			for (k_section in k_sections) {
				if (true === k_sections[k_section]) {
					k_selectedSectionsCount++;
				}
			}

			return k_selectedSectionsCount;

		}; // end of k_kerioWidget.k_getSelectedSectionsCount

		/**
		 * remove uploaded restore file
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_removeRestoreUploadedFile = function() {

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.restoreUploadCancel'
					},
					k_scope: this,

					k_callback: function(k_response, k_success) {

						if (!k_success || !k_response.k_isOk) {
							return;
						}

						this.k_formBackupAndRecovery.k_setVisible('k_uploadedRecoveryFileInfo', false);
						this.k_formBackupAndRecovery.k_setDisabled('k_uploadBackupFile', false);

					} // end of k_callback
			});

		}; // end of k_kerioWidget.k_removeRestoreUploadedFile

		/**
		 * call the cancel of manual or remote backup
		 */
		k_kerioWidget.k_cancelBackup = function() {
			this._k_wasCancelled = true;
			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.backupCancel'
					},
					k_scope: this,
					k_callback: function() {
						this.k_getBackupStatus();
					}
			});
		}; // end of k_kerioWidget.k_cancelBackup

		/**
		 * start local download immediately
		 */
		k_kerioWidget.k_startLocalDownload = function() {

			kerio.lib.k_ajax.k_request({
					k_jsonRpc: {
						method: 'SystemBackup.backupDownload'
					},
					k_isDataExport: true
			});

			this.k_formBackupAndRecovery.k_setDisabled('k_startLocalBackupButton', false);
			this.k_formBackupAndRecovery.k_setVisible('k_localBackupInfo', false);

		}; // end of k_kerioWidget.k_startLocalDownload

		/**
		 * offer download backup - confirm
		 */
		k_kerioWidget.k_offerDownloadBackup = function() {

			if (kerio.lib.k_isIPad) {
				return;
			}

			kerio.lib.k_confirm({
					k_title: k_tr('Question', 'common'),
					k_msg: k_tr('Backup file is available for download. Do you want to download it now?', 'backupAndRecoveryEditor') +
						'<br>' +
						'(' + k_tr('Answering "%1" will remove the created backup.', 'backupAndRecoveryEditor', {k_args: [k_tr('No', 'wlibButtons')]}) + ')',
					k_icon: 'question',
					k_scope: this,
					k_defaultButton: 'yes',

					// callback
					k_callback: function(k_answer) {
						if ('yes' === k_answer) {
							this.k_startLocalDownload();
						}
						else {
							this.k_cancelBackup();
						}
					} // end of k_callback
			});

		}; // end of k_kerioWidget.k_offerDownloadBackup

		/**
		 * update smtp queue status field
		 *
		 * @param k_form [object]
		 * @return [void]
		 */
		k_kerioWidget.k_updateSmtpQueueStatus = function(k_form) {
			var
				k_smtpQueueStatus = k_form.k_getItem('k_smtpQueueStatus'),
				k_refresh = '<a id=refresh>' + k_tr('Refresh', 'provisioningEditor') + '</a>',
				k_retryNow = '<a id=retryNow>' + k_tr('Retry', 'advancedOption') + '</a>',
				k_clearQueue = '<a id=clearQueue>' + k_tr('Clear', 'advancedOption') + '</a>',
				k_separator = ' &nbsp; ';

			k_smtpQueueStatus.k_removeClassName('warning');
			if (k_form._k_smtpRelayQueueAll > k_form._k_smtpRelayQueueFailed) {
				k_smtpQueueStatus.k_setSecureValue(k_tr('[There is one email being delivered.|There are %1 emails being delivered.]', 'advancedSettings', {k_args: [k_form._k_smtpRelayQueueAll], k_pluralityBy: k_form._k_smtpRelayQueueAll}) + k_separator + k_clearQueue + k_separator + k_refresh);
			}
			else if (k_form._k_smtpRelayQueueFailed > 0) {
				k_smtpQueueStatus.k_addClassName('warning');
				k_smtpQueueStatus.k_setSecureValue(k_tr('[There is one email which could not be delivered. Kerio Operator will try to send it again later. See error log for more details.|There are %1 emails which could not be delivered. Kerio Operator will try to send them again later. See error log for more details.]', 'advancedSettings', {k_args: [k_form._k_smtpRelayQueueFailed], k_pluralityBy: k_form._k_smtpRelayQueueFailed}) + k_separator + k_retryNow + k_separator + k_clearQueue + k_separator + k_refresh);
			}
			else {
				k_smtpQueueStatus.k_setValue('<span class="italic">' + k_tr('The email queue is empty.', 'advancedSettings') + '</span>' + k_separator + k_refresh);
			}
		}; // end of k_kerioWidget.k_updateSmtpQueueStatus

		/**
		 * reload smtp queue status
		 */
		k_kerioWidget.k_reloadSmtp = function() {
			this.k_formGeneral.k_getItem('k_smtpQueueStatus').k_setDisabled();
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'SmtpRelay.get'
				},
				k_callback: function(k_response, k_success) {
					var k_form = this.k_formGeneral;
					k_form.k_getItem('k_smtpQueueStatus').k_setDisabled(false);

					if (!k_success || !k_response.k_isOk) {
						return;
					}

					k_form._k_smtpRelayQueueAll = k_response.k_decoded.queueAll;
					k_form._k_smtpRelayQueueFailed = k_response.k_decoded.queueFailed;
					this.k_updateSmtpQueueStatus(k_form);
				},
				k_scope: this
			});
		}; // end of k_kerioWidget.k_reloadSmtp

		/**
		 * when user leave this screen
		 *
		 * @return [void]
		 */
		k_kerioWidget.k_onDeactivate = function() {
			this._k_stopGetBackupStatus = true; // stop SystemBackup.get when leaving this screen
			this.k_stopAutoUpdateTimeDate();
		}; // end of k_kerioWidget.k_onDeactivate

		/**
		 * Data Encryption section
		 */
		k_kerioWidget.k_toggleEncryptedVolumeWarn = function(isShow, text, linkText, isWarn) {
			var k_form = this.k_formDataEncryption,
				dataEncryptWarn = k_form.k_getItem('dataEncryptWarn');

			//toggle visibility
			dataEncryptWarn.k_setVisible(isShow);

			if (isShow && text) {
				dataEncryptWarn.k_setValue({
					k_text: text,
					k_linkText: linkText,
					k_img: isWarn ? 'img-warn' : 'img-info'
				})
			}
		};

		k_kerioWidget.k_showLowDiskSpaceAlert = function() {
			k_kerioWidget.k_showEncryptedVolumeAlert(
				k_tr('Not enough free space on encrypted volume. Please click Add to increase encrypted volume size. It might take several minutes. During volume resize all Kerio Operator services will be temporarily stopped.', 'advancedOptions'),
				k_tr('Add', 'common'),
				k_kerioWidget.k_startResizing.bind(this)
			);
		};

		k_kerioWidget.k_showCritLowDiskSpaceAlert = function() {
			k_kerioWidget.k_showEncryptedVolumeAlert(
				k_tr('Critically low free space on encrypted volume. Kerio Operator is temporarily stopped until encrypted volume size is not increased. Please click Add to increase encrypted volume size. It might take several minutes. During volume resize all Kerio Operator services will be temporarily stopped.', 'advancedOptions'),
				k_tr('Add', 'common'),
				k_kerioWidget.k_startResizing.bind(this)
			);
		};

		k_kerioWidget.k_showFreeUnusedSpaceAlert = function() {
			k_kerioWidget.k_showEncryptedVolumeAlert(
				k_tr('Encrypted volume disk usage is to low. Please click Decrease to free unused disk space. It might take several minutes. During volume resize all Kerio Operator services will be temporarily stopped.', 'advancedOptions'),
				k_tr('Decrease', 'common'),
				k_kerioWidget.k_startResizing.bind(this)
			);
		};

		k_kerioWidget.k_showEncryptedVolumeAlert = function(text, yesBtnText, startResizeCallback) {
			kerio.lib.k_confirm({
				k_title: k_tr('Warning', 'wlibAlerts'),
				k_msg: text,
				k_buttons: {
					k_yes: yesBtnText,
					k_no: k_tr('Later', 'common')
				},
				k_defaultButton: 'Yes',
				k_callback: function(k_response) {
					if (k_response === 'yes') {
						//go resize
						k_kerioWidget.k_toggleResizeProgress(true);
					}
					else {
						//just close
					}
				},
				k_scope: this
			});
		};

		k_kerioWidget.k_toggleResizeProgress = function(open) {
			//show resize progress
			k_kerioWidget.k_toggleProgressDialog(
				open,
				k_tr('Kerio Operator is resizing encrypted volume…', 'advancedOptions'),
				k_kerioWidget.k_startResizing.bind(k_kerioWidget)
			);
		};

		k_kerioWidget.k_switchEncryptDecrypt = function(showEncrypt) {
			var k_form = this.k_formDataEncryption,
				btnDecrypt = k_form.k_getItem('btnDecrypt'),
				encryptPassword = k_form.k_getItem('encryptPassword'),
				encryptPasswordConfirm = k_form.k_getItem('encryptPasswordConfirm'),
				btnEncryptCont = k_form.k_getItem('btnEncryptCont'),
				btnEncrypt = k_form.k_getItem('btnEncrypt');

			//adjust fields visibility acording encrypt state
			btnDecrypt.k_setVisible(!showEncrypt);

			encryptPassword.k_setVisible(showEncrypt);
			encryptPasswordConfirm.k_setVisible(showEncrypt);
			btnEncryptCont.k_setVisible(showEncrypt);

			//set init state
			if (showEncrypt) {
				//encrypt init state
				encryptPasswordConfirm.k_setDisabled(true);
				btnEncrypt.k_setDisabled(true);

				//values
				encryptPassword.k_setValue('');
				encryptPasswordConfirm.k_setValue('');

				//set indicator status
				k_kerioWidget.k_setDataEncryptStatus(false, k_tr('Disabled. Data encryption is disabled.', 'advancedOptions'));

				k_kerioWidget.encryptionUIState = kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.decrypted;
			}
			else {
				//decrypt init state
				//set indicator status
				k_kerioWidget.k_setDataEncryptStatus(true, k_tr('Enabled. Data is encrypted.', 'advancedOptions'));

				k_kerioWidget.encryptionUIState = kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.encrypted;
			}
		};

		k_kerioWidget.k_setDataEncryptStatus = function(isEnabled, text) {
			var k_form = this.k_formDataEncryption,
				dataEncryptStatus = k_form.k_getItem('dataEncryptStatus');

			dataEncryptStatus.k_setValue({
				k_info: text
			})

			dataEncryptStatus.k_removeClassName('status-enabled');
			dataEncryptStatus.k_removeClassName('status-disabled');
			dataEncryptStatus.k_addClassName(isEnabled ? 'status-enabled' : 'status-disabled');
		};

		k_kerioWidget.k_onEncryptPasswordChange = function(k_form) {
			var k_form = this.k_formDataEncryption,
				encryptPassword = k_form.k_getItem('encryptPassword'),
				encryptPasswordConfirm = k_form.k_getItem('encryptPasswordConfirm'),
				btnEncrypt = k_form.k_getItem('btnEncrypt'),
				password = encryptPassword.k_getValue(),
				passwordConfirm = encryptPasswordConfirm.k_getValue();

			//if entered something - enable encryptPasswordConfirm
			encryptPasswordConfirm.k_setDisabled(!password);

			//higlight if passwords not matched
			encryptPasswordConfirm.k_markInvalid(password != passwordConfirm)

			//if passwords matched - enable encrypt btn
			btnEncrypt.k_setDisabled(!password || password != passwordConfirm);
		};

		k_kerioWidget.k_onEncryptClick = function(k_form) {
			var encryptPassword = k_form.k_getItem('encryptPassword'),
				password = encryptPassword.k_getValue();

			//show encrypt dialog
			kerio.lib.k_confirm({
				k_title: k_tr('Confirm Action', 'wlibAlerts'),
				k_msg: k_tr('Please note that encryption results in more resources being utilized and hence performance could be affected. Encryption also locks the data to this particular device, hence change to the device hardware could result in the data being inaccessible. Loosing data encryption password could result in inability to turn off data encryption. Interrupting the encryption process might result in complete data loss. Please do not interrupt the encryption.', 'advancedOptions'),
				k_buttons: {
					k_yes: k_tr('Encrypt', 'common'),
					k_no: k_tr('Cancel', 'common')
				},
				k_callback: function(k_response) {
					if (k_response === 'yes') {
						//go encrypt
						//show encryption progress
						k_kerioWidget.k_toggleProgressDialog(
							true,
							k_tr('Kerio Operator is encrypting personal data…', 'advancedOptions'),
							function() {
								password = encryptPassword.k_getValue();
								//after dialog show - start encryption
								k_kerioWidget.k_startEncryption(password);
							}
						);
					}
					else {
						//restore initial state, clear pwd, pwd confirm
						k_kerioWidget.k_switchEncryptDecrypt(true);
					}
				},
				k_scope: this
			});
		};

		k_kerioWidget.k_toggleProgressDialog = function(open, text, onShow) {
			var progressDialog = kerio.lib.k_uiCacheManager.k_get('progressDialog');

			if (open) {
				//open dialog
				kerio.lib.k_ui.k_showDialog({k_sourceName: 'progressDialog', k_params: {
						k_text: text,
						k_onShow: function(dlg) {
							k_kerioWidget.isProgressDialogOpened = true;

							if (onShow) {
								onShow();
							}
						}
					}});
			}
			else {
				if (progressDialog && k_kerioWidget.isProgressDialogOpened) {
					progressDialog.k_hide();
					//set open flag
					k_kerioWidget.isProgressDialogOpened = false;
				}
			}
		};

		k_kerioWidget.k_onDecryptClick = function(k_form) {
			//check status before dialog show
			k_kerioWidget.k_getDecryptionStatus();
		};

		k_kerioWidget.k_toggleDecryptionDialog = function(open) {
			var decryptionDialog = kerio.lib.k_uiCacheManager.k_get('decryptionDialog');

			if (open) {
				//open dialog
				kerio.lib.k_ui.k_showDialog({k_sourceName: 'decryptionDialog', k_params: {
						k_onDecryptClickCallback: k_kerioWidget.k_onDecryptClickCallback
					}});

				k_kerioWidget.isProgressDialogOpened = true;
			}
			else {
				if (decryptionDialog && k_kerioWidget.isProgressDialogOpened) {
					decryptionDialog.k_hide();
					//set open flag
					k_kerioWidget.isProgressDialogOpened = false;
				}
			}
		};

		k_kerioWidget.k_toggleDecryptionDialogError = function(showPwdError) {
			var decryptionDialog = kerio.lib.k_uiCacheManager.k_get('decryptionDialog');

			if (decryptionDialog && k_kerioWidget.isProgressDialogOpened) {
				//update err visibility
				decryptionDialog.k_setErrorVisible(showPwdError);
			}
		}

		k_kerioWidget.k_onDecryptClickCallback = function(password) {
			k_kerioWidget.k_startDecryption(password);
		};

		k_kerioWidget.k_handleStartDecryption = function(k_response) {
			var k_CONST = kerio.woip.k_CONST,
				data = k_response.k_decoded,
				errorMsg = '',
				errorCode;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			if (k_response.k_isOk && data && !data.error) {
				//no errors
				//close dialog
				k_kerioWidget.k_toggleDecryptionDialog(false);
				//show decryption progress
				k_kerioWidget.k_toggleProgressDialog(true, k_tr('Kerio Operator is decrypting personal data…', 'advancedOptions'));
				//start listen progress
				k_kerioWidget.k_startCheckEncryptionProgress(k_response);
			}
			else {
				//errors handling
				if (data && data.error) {
					errorCode = data.error.code;
				}

				switch(errorCode) {
					case k_CONST.KTS_ErrorCodeIncorrectPassword://5012
						errorMsg = k_tr('Password is incorreсt', 'advancedOptions');
						//show this error in decryption dialog
						k_kerioWidget.k_toggleDecryptionDialogError(true);
						break;
					default:
						//close dialog
						k_kerioWidget.k_toggleDecryptionDialog(false);
						//show global error
						k_kerioWidget.k_onGetEncryptionStatusError(k_response);
				}
			}
		};

		/**
		 * Data Encryption Api
		 */
		k_kerioWidget.k_startEncryption = function(password) {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.startEncryption',
					params: {
						password: password
					}
				},
				k_callback: this.k_handleStartEncryption,
				k_onError: this.k_showEncryptionGlobalError,
				k_scope: this
			}, k_kerioWidget);
		};

		k_kerioWidget.k_startDecryption = function(password) {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.startDecryption',
					params: {
						password: password
					}
				},
				k_callback: this.k_handleStartDecryption,
				k_onError: this.k_showDecryptionGlobalError,
				k_scope: this
			}, k_kerioWidget);
		};

		k_kerioWidget.k_getDecryptionStatus = function() {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.getEncryptionStatus'
				},
				k_callback: this.k_handleDecryptionStatus,
				k_onError: this.k_handleGlobalEncryptionStatusError,
				k_scope: this
			}, k_kerioWidget);
		};

		k_kerioWidget.k_getEncryptionStatus = function() {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.getEncryptionStatus'
				},
				k_callback: this.k_handleInitialEncryptionStatus,
				k_onError: this.k_handleGetEncryptionStatusError,
				k_scope: this
			}, k_kerioWidget);
		};

		k_kerioWidget.k_getEncryptionProgress = function() {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.getEncryptionStatus'
				},
				k_callback: this.k_handleEncryptionStatus,
				k_onError: this.k_showEncryptionGlobalError,
				k_scope: this
			}, k_kerioWidget);
		};

		k_kerioWidget.k_startResizing = function() {
			kerio.lib.k_ajax.k_request({
				k_jsonRpc: {
					method: 'Encryption.startResizing'
				},
				k_callback: this.k_handleStartResizing,
				k_onError: this.k_showEncryptionGlobalError,
				k_scope: this
			}, k_kerioWidget);
		};
		/**
		 * Data Encryption Api end
		 */

		k_kerioWidget.k_handleStartResizing = function(k_response) {
			var data = k_response.k_decoded;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			if (k_response.k_isOk && data && !data.error) {
				//hide warn
				k_kerioWidget.k_toggleEncryptedVolumeWarn(false);
				//start check progress
				k_kerioWidget.k_startCheckEncryptionProgress();
			}
			else {
				k_kerioWidget.k_onGetEncryptionStatusError(k_response);
			}
		};

		k_kerioWidget.k_handleInitialEncryptionStatus = function(k_response) {
			var k_CONST = kerio.woip.k_CONST,
				data = k_response.k_decoded;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			//try to get status
			if (data && data.status) {
				switch (data.status) {
					case kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.decrypted:
						k_kerioWidget.k_stopCheckEncryptionProgress(true);
						break;
					case kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.encrypted:
						k_kerioWidget.k_stopCheckEncryptionProgress(false);
						break;
				}

				//encryption may be in progress
				if (data.action) {
					//switch to Store Directory Tab
					k_kerioWidget.k_setActiveTab('dataEncryption');

					//update progress
					k_kerioWidget.k_handleEncryptionProgress(data.progress, data.action);

					//start listen progress
					k_kerioWidget.k_handleStartDecryption(k_response);
				}

				//handle warn
				if (data.error) {
					switch (data.error.code) {
						case k_CONST.KTS_ErrorCodeLowDiskSpace://6000
						case k_CONST.KTS_ErrorCodeCritLowDiskSpace://6001
						case k_CONST.KTS_ErrorCodeTooMuchDiskSpace://6002
							//switch to Store Directory Tab
							k_kerioWidget.k_setActiveTab('dataEncryption');
							break;
					}

					switch (data.error.code) {
						case k_CONST.KTS_ErrorCodeLowDiskSpace://6000
							//show alert
							k_kerioWidget.k_showLowDiskSpaceAlert();

							//show warn
							k_kerioWidget.k_toggleEncryptedVolumeWarn(
								true,
								k_tr('Not enough free space on encrypted volume.', 'advancedOptions'),
								k_tr('Click here to add extra disk space.', 'advancedOptions')
							)
							break;
						case k_CONST.KTS_ErrorCodeCritLowDiskSpace://6001
							//show alert
							k_kerioWidget.k_showCritLowDiskSpaceAlert();

							//show warn
							k_kerioWidget.k_toggleEncryptedVolumeWarn(
								true,
								k_tr('Critically low free space on encrypted volume.', 'advancedOptions'),
								k_tr('Click here to add extra disk space.', 'advancedOptions'),
								true
							)
							break;
						case k_CONST.KTS_ErrorCodeTooMuchDiskSpace://6002
							//show alert
							k_kerioWidget.k_showFreeUnusedSpaceAlert();

							//show warn
							k_kerioWidget.k_toggleEncryptedVolumeWarn(
								true,
								k_tr('Encrypted volume allocate too much disk space.', 'advancedOptions'),
								k_tr('Click here to free unused disk space.', 'advancedOptions')
							)
							break;
					}
				}
			}
			else {
				//show general error
				k_kerioWidget.k_onGetEncryptionStatusError(k_response);
			}
		};

		k_kerioWidget.k_handleDecryptionStatus = function(k_response) {
			var k_CONST = kerio.woip.k_CONST,
				data = k_response.k_decoded;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			//ignore 5012 err - Password is incorreсt - api implementation bug-feature
			if (data && data.error && data && data.error.code === k_CONST.KTS_ErrorCodeIncorrectPassword) {//5012
				delete k_response.k_decoded.error;
			}

			if (k_response.k_isOk && data && !data.error) {
				//show decrypt dialog
				k_kerioWidget.k_toggleDecryptionDialog(true);
			}
			else {
				//show error alert
				k_kerioWidget.k_onGetEncryptionStatusError(k_response);
			}
		};

		k_kerioWidget.k_handleGetEncryptionStatusError = function(k_response) {
			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			//can't get actual status - just set initial UI state - decrypted
			k_kerioWidget.k_switchEncryptDecrypt(true);
		};

		k_kerioWidget.k_handleGlobalEncryptionStatusError = function() {
			//determine UI encryption / decryption state
			if (k_kerioWidget.k_getDataEncryptionUIState() === kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.encrypted) {
				k_kerioWidget.k_showEncryptionGlobalError();
			}
			else {
				k_kerioWidget.k_showEncryptionGlobalError();
			}
		};

		k_kerioWidget.k_getDataEncryptionUIState = function() {
			return k_kerioWidget.encryptionUIState;
		}

		k_kerioWidget.k_handleStartEncryption = function(k_response) {
			var data = k_response.k_decoded;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			if (k_response.k_isOk && data && !data.error) {
				k_kerioWidget.k_startCheckEncryptionProgress();
			}
			else {
				k_kerioWidget.k_onGetEncryptionStatusError(k_response);
			}
		};

		k_kerioWidget.k_startCheckEncryptionProgress = function() {
			if (!kerio.woip.k_taskRunner.k_isDefined('k_checkEncryptionProcess')) {
				kerio.woip.k_taskRunner.k_add({
					k_id: 'k_checkEncryptionProcess',
					k_scope: this,
					k_interval: 1000,
					k_run: this.k_getEncryptionProgress
				});
			}

			kerio.woip.k_taskRunner.k_start('k_checkEncryptionProcess');
		};

		k_kerioWidget.k_stopCheckEncryptionProgress = function(showEncrypt) {
			if (kerio.woip.k_taskRunner.k_isDefined('k_checkEncryptionProcess')) {
				kerio.woip.k_taskRunner.k_remove('k_checkEncryptionProcess');
			}

			//hide progress dialog
			k_kerioWidget.k_toggleProgressDialog(false);

			if (showEncrypt !== undefined) {
				//switch encrypted state
				k_kerioWidget.k_switchEncryptDecrypt(showEncrypt);
			}
		};

		k_kerioWidget.k_handleEncryptionStatus = function(k_response) {
			var data = k_response.k_decoded;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			if (k_response.k_isOk && data && !data.error) {
				if (data.action) {
					//update progress
					k_kerioWidget.k_handleEncryptionProgress(data.progress, data.action);
				}
				else {
					switch(data.status) {
						case kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.decrypted:
							k_kerioWidget.k_stopCheckEncryptionProgress(true);
							break;
						case kerio.woip.k_ui.advancedOptions.k_encryptionStateEnum.encrypted:
							k_kerioWidget.k_stopCheckEncryptionProgress(false);
							break;
					}
				}
			}
			else {
				//show general error
				k_kerioWidget.k_onGetEncryptionStatusError(k_response);
			}
		};

		k_kerioWidget.k_handleEncryptionProgress = function(data, action) {
			if (!data) {
				return;
			}

			var actionEnum = kerio.woip.k_ui.advancedOptions.k_encryptionActionEnum,
				current = data.current,
				total = data.total,
				showEncrypt;

			//show progress
			switch(action) {
				case actionEnum.encrypting:
					k_kerioWidget.k_showEncryptionProgress(current, total, true);
					showEncrypt = false;
					break;
				case actionEnum.decrypting:
					k_kerioWidget.k_showEncryptionProgress(current, total, false);
					showEncrypt = true;
					break;
				case actionEnum.resizing:
				case actionEnum.saving:
				case actionEnum.restoring:
					k_kerioWidget.k_showResizingProgress(current, total, action);
					showEncrypt = true;
					break;
			}

			//>= 100% progress - stop checking
			if ((action === actionEnum.encrypting || action === actionEnum.decrypting) && current >= total) {
				k_kerioWidget.k_stopCheckEncryptionProgress(showEncrypt);
			}
		};

		k_kerioWidget.k_showResizingProgress = function(progress, total, action) {
			var actionEnum = kerio.woip.k_ui.advancedOptions.k_encryptionActionEnum,
				text;

			if (progress !== undefined) {
				progress = progress.toFixed(1);
			}
			if (total !== undefined) {
				total = total.toFixed(1);
			}

			switch(action) {
				case actionEnum.resizing:
					text = k_tr('Enabled. Resizing encrypted volume…', 'advancedOptions');
					break;
				case actionEnum.saving:
					text = k_tr('Enabled. Saving encrypted data %1MB out of %2MB.', 'advancedOptions', {k_args: [progress, total]});
					break;
				case actionEnum.restoring:
					text = k_tr('Enabled. Restoring encrypted data %1MB out of %2MB.', 'advancedOptions', {k_args: [progress, total]});
					break;
			}

			k_kerioWidget.k_setDataEncryptStatus(true, text);
		};

		k_kerioWidget.k_showEncryptionProgress = function(progress, total, isEncryption) {
			var text;

			if (!progress) {
				if (isEncryption) {
					text = k_tr('Disabled. Preparing encrypted volume…', 'advancedOptions');
				}
				else {
					text = k_tr('Enabled. Preparing decrypted volume…', 'advancedOptions');
				}
			}
			else {
				if (progress !== undefined) {
					progress = progress.toFixed(1);
				}
				if (total !== undefined) {
					total = total.toFixed(1);
				}

				if (isEncryption) {
					text = k_tr('Disabled. Encrypted %1MB out of %2MB.', 'advancedOptions', {k_args: [progress, total]});
				}
				else {
					text = k_tr('Enabled. Decrypted %1MB out of %2MB.', 'advancedOptions', {k_args: [progress, total]});
				}
			}
			k_kerioWidget.k_setDataEncryptStatus(!isEncryption, text);
		};

		k_kerioWidget.k_onGetEncryptionStatusError = function(k_response) {
			var k_CONST = kerio.woip.k_CONST,
				data = k_response.k_decoded,
				errorMsg = '',
				errorCode;

			//remove not a real error
			k_kerioWidget.k_removeZeroCodeError(k_response);

			//errors handling
			if (data && data.error) {
				errorCode = data.error.code;
			}

			switch(errorCode) {
				case k_CONST.KTS_ErrorCodeEncryptionFailed://5000
					errorMsg = k_tr('Encryption failed. Please restart to ensure that appliance is fully operational', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeNotEnoughSpace://5001
					errorMsg = k_tr('There is not enough disk space to complete data encryption. You have to free at least %1MB to continue.', 'advancedOptions', {k_args: [data.error.need]});
					break;

				case k_CONST.KTS_ErrorCodeDecryptionFailed://5010
					errorMsg = k_tr('Decryption failed. Please restart to ensure that appliance is fully operational', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeNotEnoughSpaceDec://5011
					errorMsg = k_tr('There is not enough disk space to complete data decryption. You have to free at least %1MB to continue.', 'advancedOptions', {k_args: [data.error.need]});
					break;
				case k_CONST.KTS_ErrorCodeIncorrectPassword://5012
					errorMsg = k_tr('Password is incorreсt', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeIncPassWait://5013
					errorMsg = k_tr('Password is incorrect. You shall wait for a minute before you can try again.', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeThreeAttempts://5014
					errorMsg = k_tr('You have 3 failed attempts to enter password. Please wait for a minute before you can try again.', 'advancedOptions');
					break;

				case k_CONST.KTS_ErrorCodeResizeFailed://6010
					//show warn
					k_kerioWidget.k_toggleEncryptedVolumeWarn(true);
					errorMsg = k_tr('Encrypted volume resize failed. <br/>Please restart to ensure that appliance is fully operational.', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeResizeLowDiskSpace://6011
					//show warn
					k_kerioWidget.k_toggleEncryptedVolumeWarn(
						true,
						k_tr('Not enough free space on encrypted volume.', 'advancedOptions'),
						k_tr('Click here to add extra disk space.', 'advancedOptions')
					);
					errorMsg = k_tr('There is not enough disk space to increase encrypted volume size. <br/>Please free some disk space to complete the action.', 'advancedOptions');
					break;
				case k_CONST.KTS_ErrorCodeResizeCritLowDiskSpace://6012
					//show warn
					k_kerioWidget.k_toggleEncryptedVolumeWarn(
						true,
						k_tr('Critically low free space on encrypted volume.', 'advancedOptions'),
						k_tr('Click here to add extra disk space.', 'advancedOptions'),
						true
					);
					errorMsg = k_tr('Critically low free space on encrypted volume and there is not enough disk space to increase encrypted volume. Appliance operations are at risk.  Appliance is temporary suspended. Please free some disk space and restart the appliance.', 'advancedOptions');
					break;

				default:
					//show blobal error based on encrypt UI state
					k_kerioWidget.k_handleGlobalEncryptionStatusError();
			}

			if (errorMsg) {
				k_kerioWidget.k_showEncryptionError(errorMsg);
			}

			//stop progress, no UI reset
			k_kerioWidget.k_stopCheckEncryptionProgress();
		};

		k_kerioWidget.k_showEncryptionGlobalError = function(k_response) {
			k_kerioWidget.k_showEncryptionError(k_tr('Encryption failed. Please restart to ensure that appliance is fully operational', 'advancedOptions'));
		};

		k_kerioWidget.k_showDecryptionGlobalError = function(k_response) {
			k_kerioWidget.k_showEncryptionError(k_tr('Decryption failed. Please restart to ensure that appliance is fully operational', 'advancedOptions'));
		};

		k_kerioWidget.k_showEncryptionError = function(msg) {
			kerio.lib.k_confirm({
				k_title: k_tr('Error', 'common'),
				k_msg: msg,
				k_icon: 'warning',
				k_buttons: {
					k_yes: k_tr('OK', 'common'),
				}
			});
		};

		k_kerioWidget.k_removeZeroCodeError = function(k_response) {
			var data = k_response.k_decoded;
			//remove error if error.code === 0 - not a error

			if (data && data.error && data.error.code === 0) {
				//remove error
				delete k_response.k_decoded.error;
			}
		};
	} // end of k_addControllers

}; // end of kerio.woip.k_ui.advancedOptions
