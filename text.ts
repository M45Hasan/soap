Don't call HHA for all 14k+14k records repeatedly → check only records that are due for sync.
MongoDB stores local state → your REST API can respond quickly without waiting for SOAP.
BullMQ + Redis → processes HHA calls in controlled batches/concurrency instead of thousands at once.
nextSyncAt → determines when each patient/referral needs checking.
Status Engine → only performs an operation when the patient's status actually changes.
Indexes → quickly find the records that need synchronization.
Retry mechanism → temporary HHA/network failures don't lose synchronization.
SOAP Adapter → keeps XML/SOAP complexity isolated from your business logic.
Audit/history → you can know exactly when and why a status changed.
Scalable → as 14k becomes 50k or 100k, you don't need to redesign the whole system.
The basic idea
HHA SOAP
   ↓
Queue
   ↓
Only records that need checking
   ↓
MongoDB
   ↓
Status changed?
   ↓
YES → perform operation
NO  → do nothing

So the main benefit is less HHA API traffic + fewer MongoDB writes + faster application + easier scaling.