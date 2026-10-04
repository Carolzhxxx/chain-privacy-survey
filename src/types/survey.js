/**
 * @typedef {1|2|3|4|5|6|7} Likert7
 *
 * @typedef {Object} HopRatings
 * @property {Likert7|null} acceptability
 * @property {Likert7|null} violation
 * @property {Likert7|null} permission
 * @property {Likert7|null} realism
 * @property {Likert7|null} [perceived_share_probability]
 *
 * @typedef {Object} RoundData
 * @property {1|2} round_id
 * @property {1|2} round_order
 * @property {string|null} info_type
 * @property {Likert7|null} sensitivity_raw
 * @property {HopRatings} hop1
 * @property {HopRatings} hop2
 * @property {HopRatings} hop3
 *
 * @typedef {Object} AssignmentState
 * @property {string[]} assigned_info_types
 * @property {string[]} skipped_info_types
 * @property {string|null} round_1_info_type
 * @property {string|null} round_2_info_type
 * @property {number[]} round_order
 * @property {boolean} locked
 */

export {};
