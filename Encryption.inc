<?php
require_once 'libprocess.inc';

/**
 * @file  Encryption.inc
 * @brief Data Encryption and decryption
 *
 * @responsible vivek sharma <vivek.sharma@provistechnologies.com>
 * @author vivek sharma <vivek.sharma@provistechnologies.com>
 * @copyright Copyright (C) 1997-2011 Kerio Technologies s.r.o.
 */
require_once(dirname(__FILE__) . '/Base.inc');
require_once(dirname(__FILE__) . '/generated/EncryptionGenerated.inc');
require_once(dirname(__FILE__) . '/../structures/Language.inc');
require_once(dirname(__FILE__) . '/../structures/ProductInfoStruct.inc');
require_once(dirname(__FILE__) . '/DirectoryService.inc');
require_once(dirname(__FILE__) . '/Extensions.inc');
require_once(dirname(__FILE__) . '/Conferences.inc');
require_once(dirname(__FILE__) . '/RingingGroups.inc');
require_once(dirname(__FILE__) . '/PagingGroups.inc');
require_once(dirname(__FILE__) . '/CallQueues.inc');
require_once(dirname(__FILE__) . '/AutoAttendantScripts.inc');
require_once(dirname(__FILE__) . '/Network.inc');
require_once(dirname(__FILE__) . '/IpAddressGroups.inc');
require_once(dirname(__FILE__) . '/Firewall.inc');
require_once(dirname(__FILE__) . '/SystemSettings.inc');
require_once(dirname(__FILE__) . '/SystemBackup.inc');
require_once(dirname(__FILE__) . '/UpdateChecker.inc');
require_once(dirname(__FILE__) . '/Voicemail.inc');
require_once(dirname(__FILE__) . '/EmergencyNumbers.inc');
require_once(dirname(__FILE__) . '/OutgoingRoutes.inc');
require_once(dirname(__FILE__) . '/Session.inc');
require_once(dirname(__FILE__) . '/SystemTasks.inc');
require_once(dirname(__FILE__) . '/SmtpRelay.inc');
require_once(dirname(__FILE__) . '/SpeedDial.inc');
require_once(dirname(__FILE__) . '/PbxServices.inc');
require_once(dirname(__FILE__) . '/ProductRegistration.inc');
require_once(dirname(__FILE__) . '/../LibSystemHealth.inc');
require_once(dirname(__FILE__) . '/../AsteriskDial.inc');
require_once(dirname(__FILE__) . '/ProductActivation.inc');
require_once(dirname(__FILE__) . '/Languages.inc');
require_once('constants.inc');

@define("KERIO_OPERATOR_DATA_ENCRYPTION_SYSTEM_PASSWORD","5unnyD@y!");
@define("KERIO_OPERATOR_DATA_ENCRYPTION_STATUS","/var/etc/kerio/operator/encryptionStatus");
@define("KERIO_OPERATOR_DATA_ENCRYPTION_MUTEX","/var/etc/kerio/operator/encryptionMutex");
@define("KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS","/var/etc/kerio/operator/progress");
@define("KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_DIR","/var/etc/kerio/operator");
@define("KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE","/var/etc/kerio/operator/pdpassword");

class p_MutexEncryption {
	private $p_lockFp = null;
	private $p_lockFile;

	function __construct($p_lockFile = KERIO_OPERATOR_DATA_ENCRYPTION_MUTEX) {
		$this->p_lockFile = $p_lockFile;
	}

	/**
	 * Acquire lock
	 * @return false on failure
	 */
	function p_lock() {
		dLog('Locking ' . $this->p_lockFile . '...');
		$this->p_lockFp = fopen($this->p_lockFile . '.lock', 'w');
		if (flock($this->p_lockFp, LOCK_EX | LOCK_NB)) {
			dLog('Locking ' . $this->p_lockFile . '... locked.');
			return $this->p_lockFp; /* lock acquired */
		}
		else {
			dLog('Locking ' . $this->p_lockFile . '... failed.');
			fclose($this->p_lockFp); /* lock not acquired */
			$this->p_lockFp = null;
			return false;
		}
	}

	/**
	 * Release lock
	 */
	function __destruct() {
		if ($this->p_lockFp) {
			dLog('UnLocking ' . $this->p_lockFile . '...');
			flock($this->p_lockFp, LOCK_UN);
			fclose($this->p_lockFp);
		}
	}
}

/**
 * Server Class.
 *
 * @brief Some methods of this class are not dependant on Session (user needn't to be authorized).
 */
class Encryption extends EncryptionGenerated {

    const ENCRYPTION_ACTION_ENCRYPTING = "encrypting";
    const ENCRYPTION_ACTION_DECRYPTING = "decrypting";
    const ENCRYPTION_STATUS_ENCRYPTED = "encrypted";
    const ENCRYPTION_STATUS_DECRYPTED = "decrypted";

    /**
     *  encrypt password and return hash
     *  @param $password [string]
     */
    private function p_encryptPassword($password)
    {

        $UUID = $this->p_getUUID();
        $userPassword = $password.$UUID;
        $encrypt_method = "AES-256-CBC";
        $systemPassword = KERIO_OPERATOR_DATA_ENCRYPTION_SYSTEM_PASSWORD.$UUID;
        $hash = base64_encode( openssl_encrypt( $userPassword, $encrypt_method, $systemPassword) );
        return $hash;
    }

    /**
     * get the current system UUID
     * @return bool|string
     */
    private function p_getUUID()
    {
        Process(array('dmidecode', '-t', 'system'))->run($UUID);
        //ToDo: need some better way by regex for string operations
        $p_info = explode("UUID", $UUID);
        $p_info = explode("\n",$p_info[1]);
        return substr($p_info[0],2);
    }

    /**
     * decrypt and validate password
     * @param $password [string]
     * @return int
     */
    private function p_decryptPassword($password)
    {
        $UUID = $this->p_getUUID();
        $encrypt_method = "AES-256-CBC";
        $userPassword = $password.$UUID;
        $systemPassword = KERIO_OPERATOR_DATA_ENCRYPTION_SYSTEM_PASSWORD.$UUID;
        $hash =  file_get_contents(KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE);
        $deCryptedUserPass = openssl_decrypt( base64_decode( $hash ), $encrypt_method, $systemPassword);
        if ($deCryptedUserPass === $userPassword) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Returns current free space size in KB
     */
    private function p_getFreeSpace() {
        $p_ret = Process('df', '-B1', '/var')->outL($p_out)->run();
        if (preg_match('/^\S+\s+[0-9]+\s+[0-9]+\s+([0-9]+)\s+[0-9]+%\s+\S+$/', $p_out[1], $p_matches)) {
            return $p_matches[1];
        }
        return -1;
    }

    private function p_filesizeKb($p_file) {
        return (int) (doubleval(trim(exec('stat -c%s ' . escapeshellarg($p_file)))) / 1024);
    }

    private function p_getUsedSpace($p_entry) {
        $p_ret = Process('du', '--max-depth=0', $p_entry)->run($p_out);
        if (preg_match('/^([0-9]+)/', $p_out, $p_matches)) {
            return $p_matches[1];
        }
        return 0;
    }
	public function mylog($msg){
	$cmd="echo '" . $msg . "'>>/root/tmplog" ;
	 system($cmd);
 	}

	public function startResizing(&$p_status, &$p_action, &$p_error, &$p_progress, $password)
    {
 		$this->mylog("in resizing") ;
		$encryptedDataSize = $this->getCurrentResourceEncryptedSize();
		$encryptedVolumeSize = $this->p_getUsedSpace('/var/etc/kerio/operator/luks.container');
               $encryptedVolumeSize = $encryptedVolumeSize - 4096;

		$freeSpace = $this->p_getFreeSpace();
		$freeSpace = $this->p_getFreeSpace() / 1024;
		
 		$this->mylog("in resizing " . $encryptedVolumeSize . " " . $freeSpace . " " . $encryptedDataSize) ;
		$p_lock = new p_MutexEncryption();
		if (!$p_lock->p_lock()) {
			eLog('Another process is already running!');
			exit(1); /* failure */
		}
		if($encryptedDataSize > (0.8 * $encryptedVolumeSize) && $encryptedVolumeSize < ($freeSpace / 3)) {
			$volumeSize = $encryptedVolumeSize * 2;
			$p_ret = Process('/opt/kerio/operator/bin/dataEncryption.sh', "2", $volumeSize)->run();
            if ($p_ret == 0) {
                sLog("Data resize done.");
				$p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
            }
		} elseif($encryptedDataSize > (0.8 * $encryptedVolumeSize) && $encryptedVolumeSize > ($freeSpace / 3)) {
			$volumeSize = ($encryptedVolumeSize + $freeSpace) / 2;
			$p_ret = Process('/opt/kerio/operator/bin/dataEncryption.sh', "2", $volumeSize)->run();
			if ($p_ret == 0) {
                sLog("Data resize done.");
				$p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
            }
		} elseif($encryptedDataSize < (0.2 * $encryptedVolumeSize) ) {
			$volumeSize = $encryptedVolumeSize / 2;
			$p_ret = Process('/opt/kerio/operator/bin/dataEncryption.sh', "3", $volumeSize)->run();
			if ($p_ret == 0) {
                sLog("Data resize done.");
				$p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
            }
		}
    }

	private function checkCurrentEncryptedVolumeSize()
	{
		$encryptedDataSize = $this->getCurrentResourceEncryptedSize();
		$encryptedVolumeSize = $this->p_getUsedSpace('/var/etc/kerio/operator/luks.container');
		$freeSpace = $this->p_getFreeSpace();
		$freeSpace = $this->p_getFreeSpace() / 1024;

		if($encryptedDataSize > (0.8 * $encryptedVolumeSize)){

		} elseif($encryptedDataSize > (0.95 * $encryptedVolumeSize)){

		} elseif($encryptedDataSize > (0.20 * $encryptedVolumeSize)){

		}
	}

    /**
     * getEncryptionStatus :-
     * check if file exists encryptionStatus
     *  create constant for encryptionStatus file
     *  create getter and setter functions for encryptionStatus
     * if file does not exists then return status deCrypted
     * if file exists then get current status from file
     *  if action is encrypting == calculate progress by calculating size of completed data and total
     *
     *  if action is decrypting == calculate progress by calculating size of completed data and total
     *
     * if action is null or blank return status
     * if there is some error put that error on encryptionStatus
     */


     /**
     * get current encryption status
      * @param $p_status
      * @param $p_action
      * @param $p_error
      * @param $p_progress
      * @throws Exception
      */
    public function getEncryptionStatus(&$p_status, &$p_action, &$p_error, &$p_progress)
    {
	#	$this->mylog("checking status");
		sLog("start : status ".$p_status." action ".$p_action." error ".serialize($p_error)." progress current: ".$p_progress['current']." progress total ".$p_progress['total']);
        $p_session = new Session();
        $p_loggedUser = $p_session->p_getUsersId();
        $p_db = p_Database::p_init();
        $p_usersHelper = new p_UsersHelper();
        $p_userAttributes = $p_usersHelper->p_getUserAttributes($p_db, $p_loggedUser);
        $currentAttempt = $p_userAttributes[OPERATOR_UserAttrTypeDataEncryptionFailedLoginAttempts];
        $currentLockout = $p_userAttributes[OPERATOR_UserAttrTypeDataEncryptionLockoutDuration];
        if($currentAttempt >= 3 && time() < $currentLockout) {

            $p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
            $p_error = [
                "code" => 5014,
                "message" => QT_TRANSLATE_NOOP("serverMessage","You have 3 failed attempts to enter password. Please wait for a minute before you can try again.")
            ];
        }

        if (@file_exists(KERIO_OPERATOR_DATA_ENCRYPTION_STATUS)) {
            $p_currentStatus = $this->getCurrentStatus();
			$p_status = $p_currentStatus->status;
			$p_action = $p_currentStatus->action;
			$p_progress['current'] = (float)$p_currentStatus->progress->current;
			$p_progress['total'] = (float)$p_currentStatus->progress->total;
			$p_error = $p_currentStatus->error;

			if ($p_action == self::ENCRYPTION_ACTION_ENCRYPTING) {
				$progress = $this->getCurrentResourceEncryptedSize();
				$p_progress['current'] = (float)$progress/1024;
			} elseif ($p_action == self::ENCRYPTION_ACTION_DECRYPTING) {
				$progress = $this->p_getResourceSize();
                $p_progress['current'] = (float)$progress/1024;
            }

			if ($p_status == self::ENCRYPTION_STATUS_ENCRYPTED) {
				sLog("i m here in status encrypted");
				$encryptedDataSize = $this->getCurrentResourceEncryptedSize();
				$encryptedVolumeSize = $this->p_getUsedSpace('/var/etc/kerio/operator/luks.container');
				$encryptedVolumeSize = $encryptedVolumeSize - 4096;
				$freeSpace = $this->p_getFreeSpace();
				$freeSpace = $this->p_getFreeSpace() / 1024;
				sLog("encdatasize .".$encryptedDataSize." vol size: ".$encryptedVolumeSize);
				if($encryptedDataSize > (0.8 * $encryptedVolumeSize)){
					$p_error = [
		                "code" => 6000,
		                "message" => QT_TRANSLATE_NOOP("serverMessage","Not enough free space on encrypted volume.")
		            ];
				} elseif($encryptedDataSize > (0.95 * $encryptedVolumeSize)){
					$p_error = [
		                "code" => 6001,
		                "message" => QT_TRANSLATE_NOOP("serverMessage","Critically low free space.")
		            ];
				} elseif($encryptedDataSize < (0.20 * $encryptedVolumeSize)){
					$this->mylog("tes decrypt " . $encryptedDataSize . " " . $encryptedVolumeSize);
					$p_error = [
		                "code" => 6002,
		                "message" => QT_TRANSLATE_NOOP("serverMessage","Encrypted volume allocate too much disk space.")
		            ];
				}

				/*if (@file_exists(KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE)) {
					$p_error = [
						"code" => 6666,
						"message" => QT_TRANSLATE_NOOP("serverMessage","Kerio Operator recovered after serious failure.")
					];
				}*/
			}

        } else {
            $p_status = self::ENCRYPTION_STATUS_DECRYPTED;
        }
		sLog("end : status ".$p_status." action ".$p_action." error ".serialize($p_error)." progress current: ".$p_progress['current']." progress total ".$p_progress['total']);
    }

    /**
     * Start data encryption process
     * @param $p_status
     * @param $p_action
     * @param $p_error
     * @param $p_progress
     * @param $password
     * @throws Exception
     */
    public function startEncryption(&$p_status, &$p_action, &$p_error, &$p_progress, $password)
    {

		Process('mkdir','-p',KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_DIR)->run();
        $p_lock = new p_MutexEncryption();
    	if (!$p_lock->p_lock()) {
    		eLog('Another process is already running!');
    		exit(1); /* failure */
    	}

        // Encrypt and save user password to file
        $userPassword = $this->p_encryptPassword($password);
        Process('touch', KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE)->run();
        file_put_contents(KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE,$userPassword);
        Process('chmod','0700',KERIO_OPERATOR_DATA_ENCRYPTION_PASSWORD_FILE)->run();

        //get the resource size
        $resourceSize = $this->p_getResourceSize();
        $freeSpace = $this->p_getFreeSpace();
        $freeSpace = $freeSpace / 1024;

        if($resourceSize > $freeSpace) {
            $spaceRequired = ($resourceSize - $freeSpace) / 1024;
            $p_status = self::ENCRYPTION_STATUS_DECRYPTED;
            $p_error = [
                "code" => 6000,
                "message"=> QT_TRANSLATE_NOOP("serverMessage","There is not enough disk space to complete data encryption.
                    You have to free at least".$spaceRequired.".")
            ];
        } else {
            $volumeSize = (float)$this->p_getVolumeSizeForEncryption($resourceSize, $freeSpace);
        }

        $p_currentStatus = [
            "status" => self::ENCRYPTION_STATUS_DECRYPTED,
            "action" => self::ENCRYPTION_ACTION_ENCRYPTING,
            "progress" => ["current" => 0, "total" => $resourceSize/1024]
        ];

        $this->setCurrentStatus($p_currentStatus);
		$p_status = self::ENCRYPTION_STATUS_DECRYPTED;
		$p_action = self::ENCRYPTION_ACTION_ENCRYPTING;
		$p_progress['current'] = 0;
		$p_progress['total'] = (float)$resourceSize/1024;
		Process("touch",KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS)->run();
		//sLog("total ".$p_progress['total']);
		sLog("vol size :".$volumeSize);
		exec(sprintf("%s > %s 2>&1 & echo $! >> %s", "/opt/kerio/operator/bin/dataEncryption.sh 0  ".$volumeSize, KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS, KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS));
		//Process('/opt/kerio/operator/bin/dataEncryption.sh', "0", $volumeSize)->run();


		/*if ($p_ret == 0) {
            sLog("Personal data encryption is enabled.");
            $p_currentStatus = ["status" => self::ENCRYPTION_STATUS_ENCRYPTED];
            $this->setCurrentStatus($p_currentStatus);
        }*/
    }

    /**
     * Start data decryption process
     * @param $p_status
     * @param $p_action
     * @param $p_error
     * @param $p_progress
     * @param $password
     * @throws Exception
     */
    public function startDecryption(&$p_status, &$p_action, &$p_error, &$p_progress, $password)
    {
        sLog("Personal data encryption is disabled.--nipun");
        $p_validatePassword = $this->p_decryptPassword($password);
        $p_session = new Session();
        $p_loggedUser = $p_session->p_getUsersId();
        $p_db = p_Database::p_init();
        $p_usersHelper = new p_UsersHelper();
        $p_userAttributes = $p_usersHelper->p_getUserAttributes($p_db, $p_loggedUser);
        if ($p_validatePassword) {
            $p_usersHelper->p_setUserAttribute($p_db, $p_loggedUser, OPERATOR_UserAttrTypeDataEncryptionFailedLoginAttempts,0);
            $p_usersHelper->p_setUserAttribute($p_db, $p_loggedUser, OPERATOR_UserAttrTypeDataEncryptionLockoutDuration,0);
            $p_db->p_commit();
            $resourceSize = $this->getCurrentResourceEncryptedSize();
            $p_currentStatus = [
                "status" => self::ENCRYPTION_STATUS_ENCRYPTED,
                "action" => self::ENCRYPTION_ACTION_DECRYPTING,
                "progress" => ["current" => 0, "total" => $resourceSize/1024]
            ];
            $p_lock = new p_MutexEncryption();
        	if (!$p_lock->p_lock()) {
        		eLog('Another process is already running!');
        		exit(1); /* failure */
        	}

            $this->setCurrentStatus($p_currentStatus);
			$p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
			$p_action = self::ENCRYPTION_ACTION_DECRYPTING;
			$p_progress['current'] = 0;
			$p_progress['total'] = (float)$resourceSize/1024;
            exec(sprintf("%s > %s 2>&1 & echo $! >> %s", "/opt/kerio/operator/bin/dataEncryption.sh 1  ", KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS, KERIO_OPERATOR_DATA_ENCRYPTION_PROGRESS));
            /*if ($p_ret == 0) {
                sLog("Personal data encryption is disabled.");
                $p_currentStatus = ["status" => self::ENCRYPTION_STATUS_DECRYPTED];
                $this->setCurrentStatus($p_currentStatus);
            }*/
        } else {

            $currentAttempt = $p_userAttributes[OPERATOR_UserAttrTypeDataEncryptionFailedLoginAttempts];
            if ($currentAttempt) {
                $currentAttempt++;
            } else {
                $currentAttempt = 1;
            }
            $p_usersHelper->p_setUserAttribute($p_db, $p_loggedUser, OPERATOR_UserAttrTypeDataEncryptionFailedLoginAttempts,$currentAttempt);
            $p_usersHelper->p_setUserAttribute($p_db, $p_loggedUser, OPERATOR_UserAttrTypeDataEncryptionLockoutDuration,time()+60);
            $p_db->p_commit();
            if ($currentAttempt >= 3 ) {
                $p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
                $p_error = [
                    "code" => 5013,
                    "message" => QT_TRANSLATE_NOOP("serverMessage","Password is incorrect. You shall wait for a minute before you can try again.")
                ];
            } else {
                $p_status = self::ENCRYPTION_STATUS_ENCRYPTED;
                $p_error = [
                    "code" => 5012,
                    "message" => QT_TRANSLATE_NOOP("serverMessage","Password is incorrect.")
                ];
            }
        }
    }

    private function getCurrentStatus()
    {
        $content =  file_get_contents(KERIO_OPERATOR_DATA_ENCRYPTION_STATUS);
        $p_currentStatus = json_decode($content);
        return $p_currentStatus;
    }

    private function setCurrentStatus($p_currentStatus)
    {
        $content = json_encode($p_currentStatus);
        file_put_contents(KERIO_OPERATOR_DATA_ENCRYPTION_STATUS,$content);
    }

    /**
     * Returns current encrypted resource size in KB
     */

    private function getCurrentResourceEncryptedSize()
    {
		if(@file_exists('/var/personal_data/kerio/operator/kts.fdb')){
			$fireBirdSize = $this->p_filesizeKb('/var/personal_data/kerio/operator/kts.fdb');
		} else {
			$fireBirdSize = 0;
		}
		if(@file_exists('/var/personal_data/kerio/operator/monitor')){
			$monitorSize = $this->p_getUsedSpace('/var/personal_data/kerio/operator/monitor');
		} else {
			$monitorSize = 0;
		}
		if(@file_exists('/var/personal_data/kerio/operator/voicemail')){
			$voiceMailSize = $this->p_getUsedSpace('/var/personal_data/kerio/operator/voicemail');
		} else {
			$voiceMailSize = 0;
		}
		if(@file_exists('/var/personal_data/kerio/operator/log')){
			$logSize = $this->p_getUsedSpace('/var/personal_data/kerio/operator/log');
		} else {
			$logSize = 0;
		}
        $encryptedVolumeSize = $fireBirdSize + $monitorSize + $voiceMailSize + $logSize;
		if(!$encryptedVolumeSize > 0)$encryptedVolumeSize = $this->p_getUsedSpace('/var/personal_data/kerio/operator');
        return $encryptedVolumeSize;
    }

    /**
     * Returns current resource size for encryption in KB
     */
    private function p_getResourceSize()
    {
        $fireBirdSize = $this->p_filesizeKb('/var/lib/firebird/2.0/data/kts.fdb');
        $monitorSize = $this->p_getUsedSpace('/var/spool/asterisk/monitor');
        $voiceMailSize = $this->p_getUsedSpace('/var/spool/asterisk/voicemail');
        $logSize = $this->p_getUsedSpace('/var/operator/log');
        $resourceSize = $fireBirdSize + $monitorSize + $voiceMailSize + $logSize;
		sLog("resource size". $resourceSize);
        return $resourceSize;
    }

    /**
     * Returns calculated volume size for encryption in KB
     */

    private function p_getVolumeSizeForEncryption($resourceSize, $freeSpace)
    {
        if($resourceSize > ($freeSpace / 3) ) {
            $volumeSize = ($freeSpace + $resourceSize) / 2;
        } else {
            $volumeSize = $resourceSize * 2;
        }
		sLog("volume size". $volumeSize);
        return $volumeSize+4096;
    }

}
