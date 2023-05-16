import { useRouter } from 'next/router'
import React, { FC, useEffect, useState } from 'react'
import { mailman } from '@backend/utils/mailman'
import { Avatar, Checkbox, FlexGroup, Icon, Slider } from '@components/System'
import { ToggleSwitch } from '@components/System/ToggleSwitch'
import { UserGroupIcon, UserIcon } from '@heroicons/react/outline'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { resetGameSettings, updateGameSettings, updateLocation, updateStartTime } from '@redux/slices'
import { GameSettingsType, GameType, LocationType, MapType, UserType } from '@types'
import { formatTimeLimit } from '@utils/helperFunctions'
import { showErrorToast } from '@utils/helpers/showToasts'
import { MainModal } from '../MainModal'
import { StyledGameSettingsModal } from './'
import { Challenge } from './Challenge'

type Props = {
  isOpen: boolean
  closeModal: () => void
  mapDetails: Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>
  gameMode: GameType['mode']
}

const GameSettingsModal: FC<Props> = ({ isOpen, closeModal, mapDetails, gameMode }) => {
  const user: UserType = useAppSelector((state) => state.user)

  const [showDetailedChecked, setShowDetailedChecked] = useState(
    typeof user.gameSettings === 'undefined' ||
      (user.gameSettings?.canMove &&
        user.gameSettings?.canPan &&
        user.gameSettings?.canZoom &&
        user.gameSettings?.timeLimit === 0)
  )
  const [canMove, setCanMove] = useState(user.gameSettings?.canMove ?? true)
  const [canPan, setCanPan] = useState(user.gameSettings?.canPan ?? true)
  const [canZoom, setCanZoom] = useState(user.gameSettings?.canZoom ?? true)
  const [gameType, setGameType] = useState<'Single Player' | 'Challenge'>('Single Player')
  const [showChallengeView, setShowChallengeView] = useState(false)
  const [sliderVal, setSliderVal] = useState(user.gameSettings?.timeLimit ?? 0)
  const [challengeId, setChallengeId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const dispatch = useAppDispatch()
  const mapId = router.query.id as string // TODO

  // TO DEPRECATE WHEN NEAR YOU MAP IS DELETED
  useEffect(() => {
    if (mapId === 'near-you') {
      // TODO
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function showLocation(position) {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          const location: LocationType = {
            lat: latitude,
            lng: longitude,
          }

          dispatch(updateLocation({ location }))
        })
      }
    }
  }, [])

  const handleCancelButton = () => {
    showChallengeView ? setShowChallengeView(false) : closeModal()
  }

  const handleActionButton = async () => {
    setIsSubmitting(true)

    // Case 1: Single Player & Start
    if (gameType === 'Single Player' && !showChallengeView) {
      await handleStartGame()
    }

    // Case 2: Challenge & Invite Friends
    if (gameType === 'Challenge' && !showChallengeView) {
      await createChallenge()
      setShowChallengeView(true)
    }

    // Case 3: Challenge & Start
    if (gameType === 'Challenge' && showChallengeView) {
      // store game settings
      dispatch(updateGameSettings({ gameSettings: { canMove, canPan, canZoom, timeLimit: sliderVal } }))

      router.push(`/challenge/${challengeId}`)
    }

    setIsSubmitting(false)
  }

  const createChallenge = async () => {
    if (!user.id) {
      return router.push('/register')
    }

    const gameSettings: GameSettingsType = {
      timeLimit: sliderVal * 10,
      canMove,
      canPan,
      canZoom,
    }

    const gameData = {
      mapId: mapDetails._id,
      mapName: mapDetails.name,
      gameSettings,
      mode: gameMode,
      userId: user.id,
    }

    const res = await mailman('challenges', 'POST', JSON.stringify(gameData))

    setChallengeId(res)
  }

  const handleStartGame = async () => {
    if (!user.id) {
      return router.push('/register')
    }

    const gameSettings: GameSettingsType = {
      timeLimit: sliderVal * 10,
      canMove,
      canPan,
      canZoom,
    }

    const gameData = {
      mapId: mapDetails._id,
      mapName: mapDetails.name,
      gameSettings,
      mode: gameMode,
      // userId: user.id,
      // userLocation: user.location,
    }

    // store start time
    dispatch(updateStartTime({ startTime: new Date().getTime() }))

    // store game settings
    dispatch(updateGameSettings({ gameSettings: { canMove, canPan, canZoom, timeLimit: sliderVal } }))

    const res = await mailman('games', 'POST', JSON.stringify(gameData))

    if (res.error) {
      return showErrorToast(res.error.message)
    }

    router.push(`/game/${res}`)
  }

  const handleCheck = () => {
    // If we uncheck => show the settings container
    if (showDetailedChecked) {
      setShowDetailedChecked(false)
    }

    // If we check => reset settings to default
    else {
      dispatch(resetGameSettings())
      setShowDetailedChecked(true)
      setCanMove(true)
      setCanPan(true)
      setCanZoom(true)
      setSliderVal(0)
    }
  }

  return (
    <MainModal
      title={showChallengeView ? 'Start Challenge' : 'Start Game'}
      actionButtonText={gameType === 'Single Player' ? 'Start' : showChallengeView ? 'Start' : 'Invite'}
      cancelButtonText={showChallengeView ? 'Back' : 'Cancel'}
      isOpen={isOpen}
      onClose={closeModal}
      onCancel={handleCancelButton}
      onAction={handleActionButton}
      isSubmitting={isSubmitting}
    >
      <StyledGameSettingsModal>
        <div className="mainContent">
          {showChallengeView ? (
            <Challenge challengeId={challengeId} />
          ) : (
            <>
              <div className="map-details-wrapper">
                <Avatar type="map" src={mapDetails.previewImg} size={50} />
                <div className="map-details">
                  <span className="map-name">{mapDetails.name}</span>
                  <span className="map-description">{mapDetails.description}</span>
                </div>
              </div>

              <div className="toggleBar">
                <div
                  className={`toggleItem ${gameType === 'Single Player' ? 'active' : ''}`}
                  onClick={() => setGameType('Single Player')}
                >
                  <FlexGroup gap={12}>
                    <div className="toggleIcon">
                      <UserIcon />
                    </div>
                    <span className="toggleText">Single Player</span>
                  </FlexGroup>
                </div>

                <div
                  className={`toggleItem ${gameType === 'Challenge' ? 'active' : ''}`}
                  onClick={() => setGameType('Challenge')}
                >
                  <FlexGroup gap={12}>
                    <div className="toggleIcon">
                      <UserGroupIcon />
                    </div>
                    <span className="toggleText">Challenge</span>
                  </FlexGroup>
                </div>
              </div>

              <div className="settingsWrapper">
                <div className="checkboxWrapper">
                  <Checkbox
                    isChecked={!!showDetailedChecked}
                    setChecked={() => handleCheck()}
                    label="Default Settings: No time limit, moving allowed"
                  />
                </div>

                {!showDetailedChecked && (
                  <div className="detailedSettings">
                    <span className="roundTimeLabel">
                      Round Time: <span className="timeLimit">{formatTimeLimit(sliderVal * 10)}</span>
                    </span>

                    <div className="setting-options">
                      <div className="time-slider">
                        <Slider onChange={setSliderVal} defaultValue={sliderVal} />
                      </div>

                      <div className="movementOptions">
                        <div className="movementOption">
                          <ToggleSwitch isActive={canMove} setIsActive={setCanMove} />
                          <div className="movementOptionLabel">Move</div>
                        </div>
                        {/* <div className="movementOption">
                          <ToggleSwitch isActive={canPan} setIsActive={setCanPan} />
                          <div className="movementOptionLabel">Pan</div>
                        </div> */}
                        <div className="movementOption">
                          <ToggleSwitch isActive={canZoom} setIsActive={setCanZoom} />
                          <div className="movementOptionLabel">Zoom</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </StyledGameSettingsModal>
    </MainModal>
  )
}

export default GameSettingsModal