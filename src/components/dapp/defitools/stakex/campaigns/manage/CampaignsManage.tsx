import { Spinner } from '@dappelements/Spinner'
import { ManageStakeXContext } from '@dapphelpers/defitools'
import { useERC20Approve } from '@dapphooks/shared/useERC20Approve'
import { useHasERC20Allowance } from '@dapphooks/shared/useHasERC20Allowance'
import { useCampaignCreate } from '@dapphooks/staking/useCampaignCreate'
import { useCampaignDelete } from '@dapphooks/staking/useCampaignDelete'
import { useCampaignsGetAllCampaignsData } from '@dapphooks/staking/useCampaignGetAllCampaignsData'
import { useCampaignOpen } from '@dapphooks/staking/useCampaignOpen'
import { useCampaignRemoveStale } from '@dapphooks/staking/useCampaignRemoveStale'
import { useCampaignStart } from '@dapphooks/staking/useCampaignStart'
import { useCampaignUpdate } from '@dapphooks/staking/useCampaignUpdate'
import { useTokensGetTokens } from '@dapphooks/staking/useTokensGetTokens'
import { Tile } from '@dappshared/Tile'
import {
    CampaignData,
    STAKEXManagementCreateCampaignParams,
    STAKEXManagementUpdateCampaignParams,
    TokenInfoResponse,
} from '@dapptypes'
import { Field, Label, Select } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/Button'
import { Address } from 'viem'
import { CampaignTileCreated } from './components/CampaignTileCreated'
import { CampaignTileFinished } from './components/CampaignTileFinished'
import { CampaignTileOpened } from './components/CampaignTileOpened'
import { CampaignTileStarted } from './components/CampaignTileStarted'
import { AddCampaignOverlay } from './overlays/AddCampaignOverlay'
import { DeleteCampaignConfirmationOverlay } from './overlays/DeleteCampaignConfirmationOverlay'
import { EditCampaignOverlay } from './overlays/EditCampaignOverlay'
import { OpenCampaignOverlay } from './overlays/OpenCampaignOverlay'
import { RemoveStaleConfirmationOverlay } from './overlays/RemoveStaleConfirmationOverlay'
import { StartCampaignConfirmationOverlay } from './overlays/StartCampaignConfirmationOverlay'

enum CampaignFilter {
    ALL,
    CREATED,
    OPENED,
    RUNNING,
    FINISHED,
}

export const CampaignsManage = () => {
    const {
        data: { stakingToken, chain, protocol, owner },
    } = useContext(ManageStakeXContext)

    ///
    /// Gather Necessary Data
    ///
    const [rewardToken, setRewardToken] = useState<TokenInfoResponse>()
    const { data: dataGetTokens } = useTokensGetTokens(protocol, chain?.id!)
    useEffect(() => {
        dataGetTokens && setRewardToken(dataGetTokens[0])
    }, [dataGetTokens])

    ///
    /// Filter Entries
    ///
    const filterRef = useRef<HTMLSelectElement>(null)
    const [filter, setFilter] = useState<CampaignFilter>(CampaignFilter.ALL)
    const onChangeFilter = () => {
        setFilter(Number(filterRef.current?.value as any) || CampaignFilter.ALL)
    }

    ///
    /// Entries
    ///
    const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignData[]>()
    const {
        data: dataGetAllCampaigns,
        isLoading: isLoadingGetAllCampaigns,
        refetch: refetchGetAllCampaigns,
    } = useCampaignsGetAllCampaignsData(protocol, chain?.id!)

    useEffect(() => {
        if (dataGetAllCampaigns && !isLoadingGetAllCampaigns) {
            setFilteredCampaigns(
                [...dataGetAllCampaigns]
                    .sort((a, b) => (a.config.createdTimestamp > b.config.createdTimestamp ? -1 : 1))
                    .filter(
                        (campaign) =>
                            filter === CampaignFilter.ALL ||
                            (filter === CampaignFilter.CREATED && !campaign.config.openTimestamp) ||
                            (filter === CampaignFilter.OPENED && campaign.stats.isOpen) ||
                            (filter === CampaignFilter.RUNNING && campaign.stats.isRunning) ||
                            (filter === CampaignFilter.FINISHED && campaign.stats.isFinished)
                    )
            )
        }
    }, [dataGetAllCampaigns, isLoadingGetAllCampaigns, filter])

    ///
    /// Add Campaign
    ///
    const campaignInitData: STAKEXManagementCreateCampaignParams = {
        name: '',
        period: 0,
        rewardAmount: 0n,
    }
    const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false)
    const [addCampaignData, setAddCampaignData] = useState<STAKEXManagementCreateCampaignParams>(campaignInitData)
    const {
        write: writeCreate,
        reset: resetCreate,
        isLoading: isLoadingCampaignCreate,
        isPending: isPendingCampaignCreate,
        isSuccess: isSuccessCampaignCreate,
    } = useCampaignCreate(protocol, chain?.id!, addCampaignData)

    const onClickAddButton = () => {
        resetCreate()
        setAddCampaignData(campaignInitData)
        setIsAddCampaignModalOpen(true)
    }

    const onClickCreate = useCallback(() => writeCreate && writeCreate(), [writeCreate])

    const onCloseAddCampaignModal = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsAddCampaignModalOpen(false)
    }, [refetchGetAllCampaigns])

    ///
    /// Edit Campaign
    ///
    const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false)
    const [editCampaignData, setEditCampaignData] = useState<STAKEXManagementUpdateCampaignParams>()
    const {
        write: writeUpdate,
        reset: resetUpdate,
        isLoading: isLoadingCampaignEdit,
        isPending: isPendingCampaignEdit,
        isSuccess: isSuccessCampaignEdit,
    } = useCampaignUpdate(protocol, chain?.id!, editCampaignData!)

    const onClickEdit = (campaign: CampaignData) => {
        resetUpdate()
        setEditCampaignData({
            bucketId: campaign.config.bucketId,
            name: campaign.config.name,
            period: campaign.config.period,
            rewardAmount: campaign.config.rewardAmount,
        })
        setIsEditCampaignModalOpen(true)
    }
    const onClickUpdate = useCallback(() => writeUpdate && writeUpdate(), [writeUpdate])
    const onCloseEditCampaignModal = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsEditCampaignModalOpen(false)
    }, [refetchGetAllCampaigns])

    ///
    /// Delete Campaign
    ///
    const [isDeleteCampaignModalOpen, setIsDeleteCampaignModalOpen] = useState(false)
    const [deleteCampaignId, setDeleteCampaignId] = useState<Address>()
    const {
        write: writeDelete,
        reset: resetDelete,
        error: errorDelete,
        isLoading: isLoadingDelete,
        isPending: isPendingDelete,
        isSuccess: isSuccessDelete,
    } = useCampaignDelete(protocol, chain?.id!, deleteCampaignId!)

    const onClickDelete = useCallback(
        (campaign: CampaignData) => {
            resetDelete && resetDelete()
            setDeleteCampaignId(campaign.config.bucketId)
            setIsDeleteCampaignModalOpen(true)
        },
        [resetDelete]
    )

    const onDeleteCampaignModalOK = useCallback(() => {
        writeDelete && writeDelete()
    }, [writeDelete])

    const onDeleteCampaignModalNOK = () => {
        setDeleteCampaignId(undefined)
        setIsDeleteCampaignModalOpen(false)
    }

    const onDeleteCampaignModalClose = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsDeleteCampaignModalOpen(false)
    }, [refetchGetAllCampaigns])

    ///
    /// Open Campaign
    ///
    const [isOpenCampaignModalOpen, setIsOpenCampaignModalOpen] = useState(false)
    const [openCampaignData, setOpenCampaignData] = useState<STAKEXManagementUpdateCampaignParams>()
    const { data: dataAllowance, refetch: refetchAllowance } = useHasERC20Allowance(
        rewardToken?.source!,
        owner,
        protocol,
        chain?.id!
    )
    const {
        write: writeApprove,
        isLoading: isLoadingApprove,
        isPending: isPendingApprove,
        isSuccess: isSuccessApprove,
        reset: resetApprove,
    } = useERC20Approve(rewardToken?.source!, protocol, openCampaignData?.rewardAmount!, chain?.id!)
    const {
        write: writeOpen,
        reset: resetOpen,
        isLoading: isLoadingCampaignOpen,
        isPending: isPendingCampaignOpen,
        isSuccess: isSuccessCampaignOpen,
    } = useCampaignOpen(protocol, chain?.id!, openCampaignData!)

    const onClickOpen = (campaign: CampaignData) => {
        resetOpen()
        resetApprove()
        setOpenCampaignData({
            bucketId: campaign.config.bucketId,
            name: campaign.config.name,
            period: campaign.config.period,
            rewardAmount: campaign.config.rewardAmount,
        })
        setIsOpenCampaignModalOpen(true)
    }

    const onClickOpenCompaignModal = useCallback(() => {
        resetOpen && resetOpen()
        resetApprove && resetApprove()
        if (!openCampaignData) return

        if (dataAllowance && dataAllowance >= openCampaignData.rewardAmount) writeOpen && writeOpen()
        else writeApprove && writeApprove()
    }, [openCampaignData, writeOpen, writeApprove, dataAllowance, resetOpen, resetApprove])

    const onCloseOpenCampaignModal = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsOpenCampaignModalOpen(false)
    }, [refetchGetAllCampaigns])

    useEffect(() => {
        if (!openCampaignData) return

        if (!isPendingApprove && isSuccessApprove) {
            if (dataAllowance && dataAllowance >= openCampaignData.rewardAmount) writeOpen && writeOpen()
            else refetchAllowance && refetchAllowance()
        }
    }, [isSuccessApprove, isPendingApprove, dataAllowance, writeOpen, refetchAllowance, openCampaignData])

    ///
    /// Start Campaign
    ///
    const [isStartCampaignModalOpen, setIsStartCampaignModalOpen] = useState(false)
    const [startCampaignId, setStartCampaignId] = useState<Address>()
    const {
        write: writeStart,
        reset: resetStart,
        error: errorStart,
        isLoading: isLoadingStart,
        isPending: isPendingStart,
        isSuccess: isSuccessStart,
    } = useCampaignStart(protocol, chain?.id!, startCampaignId!)

    const onClickStart = useCallback(
        (campaign: CampaignData) => {
            resetStart && resetStart()
            setStartCampaignId(campaign.config.bucketId)
            setIsStartCampaignModalOpen(true)
        },
        [resetStart]
    )

    const onStartCampaignModalOK = useCallback(() => {
        writeStart && writeStart()
    }, [writeStart])

    const onStartCampaignModalNOK = () => {
        setStartCampaignId(undefined)
        setIsStartCampaignModalOpen(false)
    }

    const onStartCampaignModalClose = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsStartCampaignModalOpen(false)
    }, [refetchGetAllCampaigns])

    ///
    /// Finished Campaign
    ///
    const [isRemoveStaleModalOpen, setIsRemoveStaleModalOpen] = useState(false)
    const {
        write: writeRemoveStale,
        reset: resetRemoveStale,
        isLoading: isLoadingRemoveStale,
        isSuccess: isSuccessRemoveStale,
        isPending: isPendingRemoveStale,
        error: errorRemoveStale,
    } = useCampaignRemoveStale(protocol, chain?.id!)
    const onClickRemoveStale = useCallback(() => {
        resetRemoveStale && resetRemoveStale()
        setIsRemoveStaleModalOpen(true)
    }, [resetRemoveStale])
    const onRemoveStaleModalOK = useCallback(() => {
        writeRemoveStale && writeRemoveStale()
    }, [writeRemoveStale])
    const onRemoveStaleModalNOK = () => {
        setIsRemoveStaleModalOpen(false)
    }
    const onRemoveStaleModalClose = useCallback(() => {
        refetchGetAllCampaigns && refetchGetAllCampaigns()
        setIsRemoveStaleModalOpen(false)
    }, [refetchGetAllCampaigns])

    ///
    /// Linking Details Page
    ///
    const navigate = useNavigate()
    const goToDetails = useCallback(
        (campaign: CampaignData) => {
            navigate &&
                navigate(`./../../../details/${chain?.id}/${protocol}/${campaign.config.bucketId}`, {
                    relative: 'route',
                })
        },
        [chain, protocol, navigate]
    )

    return !rewardToken || isLoadingGetAllCampaigns ? (
        <Spinner theme="dark" />
    ) : (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex flex-row px-4 md:px-8">
                    <h2 className="grow text-2xl">Campaigns</h2>
                    {dataGetAllCampaigns && dataGetAllCampaigns?.length > 0 && (
                        <Button onClick={onClickAddButton} variant="primary">
                            New Campaign
                        </Button>
                    )}
                </div>

                {dataGetAllCampaigns && dataGetAllCampaigns?.length > 0 && (
                    <div className="px-4 md:px-8">
                        <Field className="flex flex-row items-center gap-3">
                            <Label>Show </Label>
                            <Select
                                className={clsx(
                                    'block w-auto appearance-none rounded-lg border-0 bg-dapp-blue-600 text-right text-base focus:ring-0 focus:ring-offset-0',
                                    'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                                    'grow-0 *:text-black'
                                )}
                                ref={filterRef}
                                onChange={onChangeFilter}
                            >
                                <option value={CampaignFilter.ALL}>all</option>
                                <option value={CampaignFilter.CREATED}>created</option>
                                <option value={CampaignFilter.OPENED}>opened</option>
                                <option value={CampaignFilter.RUNNING}>running</option>
                                <option value={CampaignFilter.FINISHED}>finished</option>
                            </Select>{' '}
                            Campaigns
                        </Field>
                    </div>
                )}

                {filteredCampaigns &&
                    filteredCampaigns.map((campaign) => (
                        <Fragment key={campaign.config.bucketId}>
                            {!campaign.stats.isOpen && !campaign.stats.isRunning && !campaign.stats.isFinished && (
                                <CampaignTileCreated
                                    campaign={campaign}
                                    rewardToken={rewardToken}
                                    onClickDelete={onClickDelete}
                                    onClickEdit={onClickEdit}
                                    onClickOpen={onClickOpen}
                                />
                            )}
                            {campaign.stats.isOpen && (
                                <CampaignTileOpened
                                    campaign={campaign}
                                    stakingToken={stakingToken!}
                                    rewardToken={rewardToken}
                                    onClickDelete={onClickDelete}
                                    onClickStart={onClickStart}
                                    goToDetails={goToDetails}
                                ></CampaignTileOpened>
                            )}
                            {campaign.stats.isRunning && (
                                <CampaignTileStarted
                                    campaign={campaign}
                                    stakingToken={stakingToken!}
                                    rewardToken={rewardToken}
                                    goToDetails={goToDetails}
                                ></CampaignTileStarted>
                            )}
                            {campaign.stats.isFinished && (
                                <CampaignTileFinished
                                    campaign={campaign}
                                    stakingToken={stakingToken!}
                                    rewardToken={rewardToken}
                                    onClickRemoveStale={onClickRemoveStale}
                                    goToDetails={goToDetails}
                                ></CampaignTileFinished>
                            )}
                        </Fragment>
                    ))}

                {filteredCampaigns && !filteredCampaigns?.length && (
                    <Tile>
                        {filter === CampaignFilter.ALL ? (
                            <div className="flex flex-col items-center justify-center gap-8 text-center text-lg">
                                <span>🚀 &nbsp; Welcome fren &nbsp; 🚀</span>
                                <span>🚀 &nbsp; Kick off your first campaign &nbsp; 🚀</span>
                                <Button onClick={onClickAddButton} variant="primary">
                                    Create My First Campaign
                                </Button>
                            </div>
                        ) : (
                            <span>
                                Currently no {filter === CampaignFilter.CREATED && 'created'}
                                {filter === CampaignFilter.OPENED && 'open'}
                                {filter === CampaignFilter.RUNNING && 'running'}
                                {filter === CampaignFilter.FINISHED && 'finished'} campaigns available
                            </span>
                        )}
                    </Tile>
                )}
            </div>
            {rewardToken && isAddCampaignModalOpen && (
                <AddCampaignOverlay
                    rewardToken={rewardToken}
                    isFormValid={addCampaignData && addCampaignData.period > 0n && addCampaignData.rewardAmount > 0n}
                    onClickCreate={onClickCreate}
                    isLoading={isLoadingCampaignCreate}
                    isPending={isPendingCampaignCreate}
                    isSuccess={isSuccessCampaignCreate}
                    isOpen={isAddCampaignModalOpen}
                    formData={addCampaignData}
                    setFormData={setAddCampaignData}
                    onClose={onCloseAddCampaignModal}
                />
            )}
            {editCampaignData && isEditCampaignModalOpen && (
                <EditCampaignOverlay
                    rewardToken={rewardToken!}
                    isFormValid={
                        editCampaignData &&
                        Boolean(editCampaignData.bucketId) &&
                        editCampaignData.period > 0n &&
                        editCampaignData.rewardAmount > 0n
                    }
                    onClickUpdate={onClickUpdate}
                    isLoading={isLoadingCampaignEdit}
                    isPending={isPendingCampaignEdit}
                    isSuccess={isSuccessCampaignEdit}
                    isOpen={isEditCampaignModalOpen}
                    formData={editCampaignData}
                    setFormData={setEditCampaignData}
                    onClose={onCloseEditCampaignModal}
                />
            )}
            {openCampaignData && isOpenCampaignModalOpen && (
                <OpenCampaignOverlay
                    rewardToken={rewardToken!}
                    isFormValid={
                        openCampaignData &&
                        Boolean(openCampaignData.bucketId) &&
                        openCampaignData.period > 0n &&
                        openCampaignData.rewardAmount > 0n
                    }
                    onClickOpen={onClickOpenCompaignModal}
                    isLoading={isLoadingCampaignOpen || isLoadingApprove}
                    isPending={isPendingCampaignOpen || isPendingApprove}
                    isSuccess={isSuccessCampaignOpen}
                    isOpen={isOpenCampaignModalOpen}
                    formData={openCampaignData}
                    setFormData={setOpenCampaignData}
                    onClose={onCloseOpenCampaignModal}
                />
            )}
            {startCampaignId && isStartCampaignModalOpen && (
                <StartCampaignConfirmationOverlay
                    campaign={dataGetAllCampaigns?.find((campaign) => campaign.config.bucketId === startCampaignId)!}
                    isLoading={isLoadingStart}
                    isSuccess={isSuccessStart}
                    isPending={isPendingStart}
                    onConfirm={onStartCampaignModalOK}
                    onCancel={onStartCampaignModalNOK}
                    onClose={onStartCampaignModalClose}
                    error={errorStart}
                    isOpen={isStartCampaignModalOpen}
                />
            )}
            {deleteCampaignId && isDeleteCampaignModalOpen && (
                <DeleteCampaignConfirmationOverlay
                    campaign={dataGetAllCampaigns?.find((campaign) => campaign.config.bucketId === deleteCampaignId)!}
                    isLoading={isLoadingDelete}
                    isSuccess={isSuccessDelete}
                    isPending={isPendingDelete}
                    isOpen={isDeleteCampaignModalOpen}
                    onConfirm={onDeleteCampaignModalOK}
                    onCancel={onDeleteCampaignModalNOK}
                    onClose={onDeleteCampaignModalClose}
                    error={errorDelete}
                />
            )}
            {isRemoveStaleModalOpen && (
                <RemoveStaleConfirmationOverlay
                    isOpen={isRemoveStaleModalOpen}
                    onConfirm={onRemoveStaleModalOK}
                    onCancel={onRemoveStaleModalNOK}
                    onClose={onRemoveStaleModalClose}
                    isLoading={isLoadingRemoveStale}
                    isSuccess={isSuccessRemoveStale}
                    isPending={isPendingRemoveStale}
                    error={errorRemoveStale}
                />
            )}
        </>
    )
}
