import {cleanup} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('../../src/libs/Permissions');

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_IOUS: 'reportIOUs_',
        POLICY: 'policy_',
    },
};

describe('Sidebar', () => {
    beforeAll(() => Onyx.init({
        keys: ONYXKEYS,
        registerStorageEventListener: () => {},
    }));

    // Cleanup (ie. unmount) all rendered components and clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('excludes a report with no participants', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a report with no participants
            const report = LHNTestUtils.getFakeReport([]);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that report
                .then(() => Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });

        it('includes or excludes policy expense chats depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a policy expense report
            // and the user not being in any betas
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy expense beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_EXPENSE_CHAT],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes user created policy rooms depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a user created policy room report
            // and the user not being in any betas
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_ROOMS],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes default policy rooms depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports with the three different types of default policy rooms
            // and the user not being in any betas
            const report1 = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the default policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                }))

                // Then all three reports are showing in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(3);
                });
        });

        it('includes default policy rooms for free policies, regardless of the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a default policy room report on a free policy
            // and the user not being in any betas
            const policy = {
                policyID: '1',
                type: CONST.POLICY.TYPE.FREE,
            };
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID: policy.policyID,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                }))

                // Then the report is rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                })

                // When the policy is a paid policy
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`, {type: CONST.POLICY.TYPE.CORPORATE}))

                // Then the report is not rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });

        describe('all combinations of hasComments, isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', () => {
            // Given a report that is the active report and doesn't change
            const report1 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']);

            // Given a free policy that doesn't change
            const policy = {
                name: 'Policy One',
                policyID: '1',
                type: CONST.POLICY.TYPE.FREE,
            };

            // Given the user is in all betas
            const betas = [
                CONST.BETAS.DEFAULT_ROOMS,
                CONST.BETAS.POLICY_ROOMS,
                CONST.BETAS.POLICY_EXPENSE_CHAT,
            ];

            // Given there are 7 boolean variables tested in the filtering logic:
            // 1. hasComments
            // 2. isArchived
            // 3. isUserCreatedPolicyRoom
            // 4. hasAddWorkspaceError
            // 5. isUnread
            // 6. isPinned
            // 7. hasDraft
            // There is one setting not represented here, which is hasOutstandingIOU. In order to test that setting, there must be
            // additional reports in Onyx, so it's being left out for now. It's identical to the logic for hasDraft and isPinned though.

            // Given these combinations of booleans which result in the report being filtered out (not shown).
            const booleansWhichRemovesInactiveReport = [
                // isUserCreatedPolicyRoom
                JSON.stringify([false, false, true, false, false, false, false]),

                // isUserCreatedPolicyRoom, isUnread
                JSON.stringify([false, false, true, false, true, false, false]),

                // isUserCreatedPolicyRoom, hasAddWorkspaceError
                JSON.stringify([false, false, true, true, false, false, false]),

                // isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread
                JSON.stringify([false, false, true, true, true, false, false]),

                // isArchived
                JSON.stringify([false, true, false, false, false, false, false]),

                // isArchived, isUnread
                JSON.stringify([false, true, false, false, true, false, false]),

                // isArchived, hasAddWorkspaceError
                JSON.stringify([false, true, false, true, false, false, false]),

                // isArchived, hasAddWorkspaceError, isUnread
                JSON.stringify([false, true, false, true, true, false, false]),

                // isArchived, isUserCreatedPolicyRoom
                JSON.stringify([false, true, true, false, false, false, false]),

                // isArchived, isUserCreatedPolicyRoom, isUnread
                JSON.stringify([false, true, true, false, true, false, false]),

                // isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError
                JSON.stringify([false, true, true, true, false, false, false]),

                // isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread
                JSON.stringify([false, true, true, true, true, false, false]),
            ];

            // When every single combination of those booleans is tested

            // Taken from https://stackoverflow.com/a/39734979/9114791 to generate all possible boolean combinations
            const AMOUNT_OF_VARIABLES = 7;
            // eslint-disable-next-line no-bitwise
            for (let i = 0; i < (1 << AMOUNT_OF_VARIABLES); i++) {
                const boolArr = [];
                for (let j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                    // eslint-disable-next-line no-bitwise
                    boolArr.push(Boolean(i & (1 << j)));
                }

                // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
                // for the specific case that's failing. You can then debug the code to see why the test is not passing.
                // const boolArr = [false, true, false, false, false, false, false];

                it(`the booleans ${JSON.stringify(boolArr)}`, () => {
                    const report2 = {
                        ...LHNTestUtils.getAdvancedFakeReport(...boolArr),
                        policyID: policy.policyID,
                    };
                    const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

                    return waitForPromisesToResolve()

                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() => Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: report1.reportID.toString(),
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                        }))

                        // Then depending on the outcome, either one or two reports are visible
                        .then(() => {
                            if (booleansWhichRemovesInactiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                                // Only one report visible
                                expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(1);
                                expect(sidebarLinks.queryAllByA11yLabel('Chat user display names')).toHaveLength(1);
                                const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                                expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                            } else {
                                // Both reports visible
                                expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(2);
                            }
                        });
                });
            }
        });
    });

    describe('in #focus mode', () => {
        it('hides unread chats', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given the sidebar is rendered in #focus mode (hides read chats)
            // with report 1 and 2 having unread actions
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: report1.reportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports 1 and 2 are shown and 3 is not
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(2);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                })

                // When report3 becomes unread
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1}))

                // Then all three chats are showing
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 1 becomes read (it's the active report)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER}))

                // Then all three chats are still showing
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 2 becomes the active report
                .then(() => Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, report2.reportID.toString()))

                // Then report 1 should now disappear
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(2);
                    expect(sidebarLinks.queryAllByText(/One, Two/)).toHaveLength(0);
                });
        });
    });
});
