export const TERMS_TITLE = "BidClub Platform Terms of Service and Rules";

export const TERMS_META = "Last revised: Meskerem 20, 2019 E.C. | 30 September 2026";

export type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "intro",
    title: "",
    paragraphs: [
      "BidClub",
      "Website: https://bidclub.et",
      "Last revised: Meskerem 20, 2019 E.C. | 30 September 2026",
      "These Terms govern registration on BidClub, placing bids, making payments, determining winners, delivering items, and the rights and obligations of users. Please read them in full before registering or making any payment.",
    ],
  },
  {
    id: "parties-acceptance",
    title: "1. Parties to the Agreement and Acceptance",
    paragraphs: [
      "1.1. This Agreement is entered into between BidClub (“the Company” or “we”) and any user of BidClub (“the User” or “the Bidder”).",
      "1.2. By accepting this Agreement — which is presented to the User and confirmed by selecting “I Agree” — the User agrees to be bound by its provisions. A person who does not accept this Agreement must not register, make a payment, or place a bid.",
      "1.3. The specific published details of each Arena (auction) form part of this Agreement. Those specific details must be clearly displayed before participation and may not override any rights protected by law.",
    ],
  },
  {
    id: "service-operation",
    title: "2. How the Service Works",
    paragraphs: [
      "2.1. BidClub is a digital bidding platform on which Bidders submit price offers for listed items or services. At the moment an Arena closes, the winner is determined to be the Bidder who, among all valid bids recorded, submitted the lowest price that no one else also submitted.",
      "2.2. The criterion for determining the winner is the lowest-unique-bid rule described in Article 6. A winner is never selected by lottery or by any random-number draw.",
      "2.3. The Bidder alone decides the amount they submit. Because the outcome also depends on the amounts submitted by other Bidders, neither winning nor recovering the value of the fee paid to participate is guaranteed. Placing repeated bids may increase the chance of winning, but it never guarantees victory.",
    ],
  },
  {
    id: "definitions",
    title: "3. Definitions",
    paragraphs: [
      "3.1. “Platform” means bidclub.et and any other digital service channels related to BidClub that are officially provided by the Company.",
      "3.2. “Bid Amount” means the price, denominated in Ethiopian Birr, that a Bidder submits. The permitted numeric range, decimal places, and bidding limits are displayed before submission.",
      "3.3. “Unique Bid” means an amount submitted by exactly one Bidder within the same Arena. A “Duplicate Amount” means an identical amount submitted by two or more Bidders.",
      "3.4. “Lowest Unique Bid” means the lowest amount among all valid unique bids at the time the Arena closes.",
      "3.5. “Bid Service Fee” means the fee, clearly disclosed on the Platform, charged each time a bid is placed. This fee is separate from the bid amount itself; the circumstances in which it may be refunded are set out in Article 5.",
      "3.6. “Promotional Credit” or “Bonus” means a benefit the Company grants, under stated conditions, that may be applied toward the Bid Service Fee. Where such a benefit is granted, its usage limits and expiry date are disclosed separately.",
    ],
  },
  {
    id: "eligibility-account-security",
    title: "4. Participation Requirements and Account Security",
    paragraphs: [
      "4.1. The User must be at least 18 years of age and legally capable of entering into a binding contract under applicable law. Before participating, the User must satisfy any location- or delivery-related restrictions stated for that Arena.",
      "4.2. Each individual may hold only one account. Participating using false information, another person's identity, or multiple accounts is strictly prohibited.",
      "4.3. The User must provide accurate and up-to-date information, keep their login credentials and one-time passcode (OTP) confidential, and immediately notify the Company upon becoming aware of any unauthorized use of their account.",
      "4.4. The Company may request appropriate supporting documents to verify age, identity, ownership of a payment method, or winner status. The information requested will be limited to what is reasonably necessary for that purpose.",
    ],
  },
  {
    id: "fees-tax-refunds",
    title: "5. Fees, Taxes, and Refunds",
    paragraphs: [
      "5.1. Before any payment is made, the service fee, the number of bids it covers, and any other obligations are clearly displayed. The total cost owed is determined based on the disclosed fee and the transactions actually carried out.",
      "5.2. Payment may be made only through payment options officially offered on the Platform, and these options may change over time. The User must retain proof of payment; sending a payment alone does not confirm that a bid has been registered.",
      "5.3. Where the service has been properly rendered and the bid duly registered, the Bid Service Fee will not be refunded merely because the Bidder did not win, changed their mind, or voluntarily discontinued participation. This provision does not override any refund rights granted by law.",
      "5.4. Payments mistakenly charged twice, transactions where a fee was charged but the corresponding service was not rendered, bids cancelled by the Company, and the situation described in Article 6.7 will each be investigated, and the related fees refunded. A bid that was correctly registered will not be cancelled solely because of a network problem on the User's side.",
      "5.5. A refund request must be supported by evidence of the underlying transaction. The Company will communicate the outcome of its review, the amount to be refunded, and the timing of the refund. Refunds will, wherever possible, be made through the original payment method; a cash refund will not be substituted with a bonus without the User's consent.",
      "5.6. Displayed service fees and item prices include any taxes the Company is required to collect, including VAT where applicable. Tax already included in the displayed price will not be charged again. Where there is any additional cost for delivery, registration, or transfer of ownership, its amount (or the basis for calculating it) and who is responsible for paying it will be disclosed before participation.",
      "5.7. Where a bonus has been granted, it may not be withdrawn in cash or transferred to another person unless expressly stated otherwise. If a bid is cancelled, any amount of bonus used for it is restored as bonus. Any remaining balance that was purchased with cash and left unused is not treated as a bonus; its refund is governed by applicable law and the conditions disclosed prior to purchase.",
    ],
  },
  {
    id: "bidding-rules-outcome",
    title: "6. Bidding Rules and Outcome",
    paragraphs: [
      "6.1. Each Arena's page displays the item's or service's name and key specifications, the service fee, the permitted price range, the opening and closing date and time, and the delivery conditions. Times are stated in Ethiopian time (UTC+3) using a 24-hour format; if a different format is used, this must be clearly indicated.",
      "6.2. A valid bid is one that was registered in the system before the closing time, satisfies the applicable payment or bonus requirement, and complies with the stated rules. The User must be shown confirmation that their bid has been registered.",
      "6.3. When an Arena closes, the Bidder who submitted the lowest amount that no other Bidder also submitted becomes the winning candidate. An identical amount submitted by two or more Bidders is not unique and therefore cannot win.",
      "6.4. The number of bids permitted per Bidder, whether the same Bidder may resubmit an amount they already chose, and whether a submitted bid may be changed or cancelled are all disclosed on the Platform before submission. No change or cancellation will be made outside of what the Platform permits. A single person repeating the same amount is never counted as bids from two separate Bidders.",
      "6.5. Where bid-status information is displayed on the Platform, it reflects only the status at that point in time and may change as further bids are submitted. Being labelled “unique” alone does not mean “lowest unique” or “final winner.”",
      "6.6. System records are used to verify the timing, amount, and payment status of each bid. The result may be subject to an error and fraud review before it is finalized. Confirmed errors will be corrected on the basis of evidence; the User has the right to dispute the records and to file a complaint.",
      "6.7. If, among the valid bids registered by the closing time, no unique amount can be found, the Arena closes without a winner. Service fees paid for that Arena will be refunded under Article 5. The Company will not introduce a new winner-determination criterion after closing.",
    ],
  },
  {
    id: "winner-verification-payment",
    title: "7. Winner Verification and Payment",
    paragraphs: [
      "7.1. A winning candidate becomes the winner only once their identity, age, the validity of their bid and payment, and their compliance with the requirements of this Agreement have all been verified.",
      "7.2. Within 2 business days after an Arena closes, the Company will send notice to the candidate via their registered phone number, SMS, or a Platform notification. If verification has not yet been completed, the Company will disclose the reason for the delay and the expected timeframe. The notice will include the item's name, the relevant Arena/bid reference, and the next step the candidate must take.",
      "7.3. The candidate must respond and submit any required verification documents within 14 calendar days of receiving the notice. The final deadline will be stated in the notice itself. Once verification is complete, payment and delivery will proceed in accordance with the conditions stated for that Arena.",
      "7.4. The winner must pay the amount of their winning bid, together with any additional costs disclosed in advance under Article 5.6. The Bid Service Fee is not deducted from the item's price unless expressly stated otherwise.",
      "7.5. If the candidate is found ineligible, declines to accept, fails to make payment within the stated period, or fails to respond within the specified time despite having received notice and a reminder, the Company may, stating its reason, cancel that candidacy. An alternative candidate — the eligible holder of the next-lowest unique amount in the confirmed closing result — then becomes the winner. If no eligible candidate remains, Article 6.7 applies. All lawful rights to complain remain unaffected.",
    ],
  },
  {
    id: "delivery-warranty-defects",
    title: "8. Delivery, Warranty, and Defects",
    paragraphs: [
      "8.1. The item or service must match the model, size, condition, and key features described for the Arena. Where images are for illustration only, this must be clearly stated; misleading descriptions are not permitted.",
      "8.2. The delivery location, timing, transport cost, conditions for reserving a travel or service slot, and any other restrictions are disclosed in the Arena's details. The winner must provide confirmation of delivery. This confirmation does not waive any defect-related rights that are protected by law.",
      "8.3. Any apparent damage to, or discrepancy in, an item at the time it is received should be reported, together with supporting evidence, as promptly as possible — ideally within 24 hours. This window exists to enable a fast response; it does not bar a defect discovered later, nor any claim protected by law.",
      "8.4. Where a manufacturer's or supplier's warranty applies, the entity providing it, the warranty period, and its conditions will be disclosed. Such a warranty does not override the Company's statutory obligations. Repair, replacement, or refund will be determined in accordance with applicable law and the facts of the case.",
      "8.5. If the Company is unable to supply the described item, or a material change becomes necessary, the User will be notified immediately. No substitute item will be imposed without the winner's explicit agreement. If the Arena is cancelled, the service fees and any item payment made for it will be refunded under Article 5.",
    ],
  },
  {
    id: "fair-play-fraud-prevention",
    title: "9. Fair Participation and Fraud Prevention",
    paragraphs: [
      "9.1. Placing bids using bots, scripts, or unauthorized automation, exploiting a system weakness, seeking unauthorized access to data, or disrupting the operation of the Platform is prohibited.",
      "9.2. Colluding with others to control an outcome, creating information intended to mislead other Bidders, falsifying proof of payment, abusing the bonus system, and opening an additional account in another person's name are all prohibited.",
      "9.3. Where there is a substantive suspicion of a violation, the Company may, while preserving all necessary records, temporarily suspend an account, transaction, or delivery pending investigation. Unless prohibited by law, the Company will disclose its reason for doing so, and the User will be given an opportunity to explain and to file a complaint.",
      "9.4. Where a violation is confirmed by evidence, the Company may decide to cancel related bids, withhold winner status, or close the account. Mere suspicion alone is never sufficient grounds to forfeit all of a User's funds. The treatment of any remaining balance and refunds will be determined by applicable law, the confirmed violation, and the related transaction.",
      "9.5. The Company and its payment partners may request verification, or submit reports required by law, in connection with their respective payment- and anti-money-laundering obligations.",
    ],
  },
  {
    id: "privacy-promotion",
    title: "10. Data Protection and Promotion",
    paragraphs: [
      "10.1. Account, payment, bidding, and delivery data is processed on an appropriate legal basis in order to provide the Service, verify identity, prevent fraud, and fulfill legal obligations.",
      "10.2. The categories of data collected, the purposes for which it is used, retention periods, sharing with other parties, any cross-border transfer and the conditions attached to it, User rights, and contact details are set out in a separate Privacy Policy. Accepting this Agreement does not constitute blanket consent to every possible use of data.",
      "10.3. I consent to the Company using the winner's photo, video, full name, or testimonial as content for its social media.",
      "10.4. Declining to consent to promotional use does not affect winner status or the right to receive the item. The User may withdraw consent previously given; withdrawing consent does not retroactively render unlawful any use that was lawfully carried out before the withdrawal.",
      "10.5. Result-transparency information is published only on a lawful basis and only to the extent necessary. Identification documents, full phone numbers, and confidential payment information are never published publicly. Promotional messages are sent in accordance with applicable law and the User's preferences, and the User may unsubscribe from them at any time.",
    ],
  },
  {
    id: "technical-issues-liability",
    title: "11. Technical Issues and Liability",
    paragraphs: [
      "11.1. The Company will operate the Platform with reasonable care. While uninterrupted service cannot be guaranteed at all times, this provision does not generally exclude liability arising from the Company's fault or under applicable law.",
      "11.2. If a severe technical issue, a security incident, a legal order, or a force-majeure event disrupts fair bidding, the Company may, after recording the issue, pause, extend, or cancel the Arena. The reason for doing so, its effect on already-registered bids, and the revised timeline will be disclosed promptly.",
      "11.3. An Arena will not be extended solely because it did not attract sufficient participation or revenue. A review conducted after closing is never grounds to reopen bidding for new entries. If a fair outcome cannot be assured, the Arena will be cancelled and Article 5 will apply.",
      "11.4. Liability arising from fraud, gross negligence, or any obligation that cannot be limited under applicable law is not excluded by this Agreement. All other liability and compensation claims will be determined in accordance with applicable law, causation, and evidence.",
    ],
  },
  {
    id: "amendments-account-closure",
    title: "12. Amendments to These Terms and Account Closure",
    paragraphs: [
      "12.1. The Company may amend this Agreement. Material changes will be disclosed on the Platform, or through other appropriate notice, before they take effect, together with their effective date. Where necessary, renewed explicit acceptance will be required from Users.",
      "12.2. In general, the rules published at the time an Arena opens continue to govern that Arena. Except where a legal order applies, or a necessary circumstance described in Article 11 arises, a change will not be applied retroactively to bids that have already been registered.",
      "12.3. A User may request, in writing, that their account be closed at any time. Closure does not, by itself, cancel previously registered bids, obligations already created, or any data-retention requirement imposed by law. Any remaining balance and refund rights will be determined under Article 5.",
    ],
  },
  {
    id: "complaints-law-disputes",
    title: "13. Complaints, Governing Law, and Disputes",
    paragraphs: [
      "13.1. This Agreement is governed by the laws applicable in Ethiopia. No provision of this Agreement shall be interpreted as removing any User right that is protected by law.",
      "13.2. Where a User has a complaint, they should submit it to the Company as promptly as possible, together with the relevant bid or transaction reference, a description of the issue, and any necessary supporting evidence. Notifying the Company within 48 hours helps enable a prompt investigation; however, exceeding this period alone does not forfeit any lawful claim or complaint.",
      "13.3. The Company will receive the complaint, investigate it within a reasonable time, and communicate its expected response time to the User. If the matter cannot be resolved by agreement, the User may bring it before a competent regulatory authority or court. Nothing in this Agreement removes any court jurisdiction granted by law.",
      "13.4. If any provision of this Agreement is found to be unenforceable, the remaining provisions will continue to be enforceable to the fullest extent permitted by law.",
      "13.5. Customer Service and Legal Notices: BidClub. Website: https://bidclub.et.",
    ],
  },
];
