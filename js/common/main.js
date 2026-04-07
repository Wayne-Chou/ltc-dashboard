// main.js

window.renderView = function () {
  const container = document.getElementById("appView");

  if (!container) return;

  if (dashboardState.view === "compare") {
    container.innerHTML = renderCompareView();
    initCompareView();
  } else {
    container.innerHTML = renderDefaultView();
    initDefaultView();
  }
  applyI18n();
};
function renderCompareView() {
  return `
    <div class="bg-white p-4 rounded shadow-sm mb-4">
      <h5 class="fw-bold mb-3">
        <i class="bi bi-intersect me-2"></i>
        群體比較
      </h5>

      <div class="mb-3">
        <div class="small text-muted mb-2">
          已選擇據點（最多3個）
        </div>
        <div id="selectedSites" class="d-flex flex-wrap gap-2"></div>
      </div>

      <div class="mb-3 text-muted small">
        👉 點擊下方據點開始比較
      </div>

      <div id="siteSelector" class="row g-2"></div>
    </div>

    <!-- ⭐ 完全比照 default 的 card 結構 -->
    <div class="row g-4">

      <!-- 坐站 -->
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="fw-semibold text-dark mb-0">
                平均坐站秒數
              </h5>
              <button
                class="btn btn-sm btn-outline-primary download-chart"
                data-target="sitStandChartCanvas"
              >
                <i class="fa fa-download me-1"></i>
                下載圖檔
              </button>
            </div>

            <div class="text-muted small mb-2">
              建議小於12秒
            </div>

            <div
              class="chart-container"
              style="position: relative; height: 300px; width: 100%"
            >
              <canvas id="sitStandChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 平衡 -->
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="fw-semibold text-dark mb-0">
                平均平衡測驗得分
              </h5>
              <button
                class="btn btn-sm btn-outline-primary download-chart"
                data-target="balanceChartCanvas"
              >
                <i class="fa fa-download me-1"></i>
                下載圖檔
              </button>
            </div>

            <div class="text-muted small mb-2">
              建議大於3.5分
            </div>

            <div
              class="chart-container"
              style="height: 300px; width: 100%"
            >
              <canvas id="balanceChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 步行 -->
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="fw-semibold text-dark mb-0">
                平均步行速度趨勢
              </h5>
              <button
                class="btn btn-sm btn-outline-primary download-chart"
                data-target="gaitChartCanvas"
              >
                <i class="fa fa-download me-1"></i>
                下載圖檔
              </button>
            </div>

            <div class="text-muted small mb-2">
              建議大於等於100cm/s
            </div>

            <div
              class="chart-container"
              style="height: 300px; width: 100%"
            >
              <canvas id="gaitChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 風險 -->
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="fw-semibold text-dark mb-0">
                平均AI跌倒風險機率
              </h5>
              <button
                class="btn btn-sm btn-outline-primary download-chart"
                data-target="riskChartCanvas"
              >
                <i class="fa fa-download me-1"></i>
                下載圖檔
              </button>
            </div>

            <div class="text-muted small mb-2" style="opacity: 0">
              placeholder
            </div>

            <div
              class="chart-container"
              style="height: 300px; width: 100%"
            >
              <canvas id="riskChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
function renderDefaultView() {
  return `
     <!-- 檢測摘要 -->
          <div class="mt-4 mb-4 bg-white p-4 rounded shadow compare-hide">
            <h5
              id="summary"
              class="fw-bold text-dark mb-3 d-flex align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="me-2 text-primary"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span data-i18n="summary">檢測統計摘要</span>
            </h5>
            <div class="my-3 hide-on-all">
              <div class="input-group">
                <input
                  type="text"
                  id="dateRange"
                  class="form-control"
                  placeholder="請選擇日期範圍"
                  data-i18n-placeholder="selectDateRange"
                />
                <button
                  class="btn btn-outline-secondary"
                  id="clearBtn"
                  data-i18n="clear"
                >
                  清除
                </button>
              </div>
            </div>

            <!-- 統計資訊 -->
            <div class="row g-4">
              <div class="col-md-4 main-col">
                <div class="stat-card stat-blue">
                  <h6 class="fw-semibold mb-2" data-i18n="totalTestedPeople">
                    總計檢測人數
                  </h6>
                  <div class="d-flex align-items-end">
                    <span id="totalCount" class="display-6 fw-bold text-blue"
                      >0</span
                    >
                    <span class="ms-2 mb-1 text-blue" data-i18n="unitPeople"
                      >人</span
                    >
                  </div>
                  <p id="startDateText" class="small mt-2 text-blue">
                    尚無資料
                  </p>
                </div>
              </div>

              <div class="col-md-4 main-col">
                <div class="stat-card stat-green">
                  <h6 class="fw-semibold mb-2" data-i18n="totalTestVisits">
                    總計檢測人次
                  </h6>
                  <div class="d-flex align-items-end">
                    <span
                      id="latestCount"
                      class="display-6 fw-bold text-green"
                    ></span>
                    <span class="ms-2 mb-1 text-green" data-i18n="unitVisits"
                      >人次</span
                    >
                  </div>
                  <p id="latestDate" class="small mt-2 text-green">尚無資料</p>
                </div>
              </div>

              <div class="col-md-4 sechide">
                <div class="stat-card stat-purple">
                  <h6 class="fw-semibold mb-2" data-i18n="locationSiteCount">
                    檢測據點數
                  </h6>
                  <div class="d-flex align-items-end">
                    <span
                      id="locationCount"
                      class="display-6 fw-bold text-purple"
                    ></span>
                    <span class="ms-2 mb-1 text-purple" data-i18n="unitPlaces"
                      >處</span
                    >
                  </div>
                  <p id="locationList" class="small mt-2 text-purple"></p>
                </div>
              </div>
            </div>

            <!-- 表格 -->
            <div class="mt-4 hide-on-all">
              <h6
                class="fw-semibold text-secondary mb-3"
                data-i18n="historyAverageTable"
              >
                歷次檢測平均成績表
              </h6>

              <div class="d-flex gap-2 mb-3">
                <button
                  id="checkAllBtn"
                  class="btn btn-outline-primary btn-sm"
                  data-i18n="selectAll"
                >
                  全選
                </button>
                <button
                  id="uncheckAllBtn"
                  class="btn btn-outline-secondary btn-sm"
                  data-i18n="unselectAll"
                >
                  取消全選
                </button>
              </div>

              <div id="assessmentCardsContainer" class="row g-3"></div>

              <div
                id="tablePaginationContainer"
                class="d-flex justify-content-between align-items-center mt-4 w-100"
              ></div>
            </div>
          </div>

          <!-- <div class="mt-4 hide-on-all mb-4" id="groupCompareSection">
        <div class="bg-white p-4 rounded shadow-sm border">
          <div
            class="d-flex justify-content-between align-items-center mb-4"
          >
            <h5 class="fw-bold text-dark m-0 d-flex align-items-center">
              <i class="bi bi-intersect text-primary me-2"></i>
              群體比較分析
            </h5>
            <div
              class="d-flex align-items-center bg-light px-3 py-2 rounded-pill border"
            >
              <label
                class="form-check-label small fw-bold me-2 text-secondary"
                for="groupCompareToggle"
                >啟用比較模式</label
              >
              <div class="form-check form-switch m-0">
                <input
                  class="form-check-input custom-switch-lg"
                  type="checkbox"
                  id="groupCompareToggle"
                  style="cursor: pointer; width: 3rem; height: 1.5rem"
                />
              </div>
            </div>
          </div>

          <div class="text-secondary small mb-4 p-2 bg-light rounded">
            <i class="bi bi-info-circle me-1"></i>
            比較不同時間區間的整體變化（以群體平均值為基準）
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="small fw-bold text-muted mb-1"
                >第一個日期</label
              >
              <div class="input-group shadow-sm">
                <input
                  id="groupA-range"
                  class="form-control bg-white"
                  placeholder="請選擇開始至結束日期"
                  readonly
                />
                <button class="btn btn-outline-secondary" id="clearGroupA">
                  清除
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <label class="small fw-bold text-muted mb-1"
                >第二個日期</label
              >
              <div class="input-group shadow-sm">
                <input
                  id="groupB-range"
                  class="form-control bg-white"
                  placeholder="請選擇開始至結束日期"
                  readonly
                />
                <button class="btn btn-outline-secondary" id="clearGroupB">
                  清除
                </button>
              </div>
            </div>
          </div>

          <div id="groupCompareResult"></div>
        </div>
      </div> -->
          <!-- 風險分級統計區塊 -->
          <div class="mb-4 hide-on-all compare-hide">
            <h5
              id="risk"
              class="fw-bold text-dark mb-3 d-flex align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="me-2 text-primary"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span data-i18n="riskStats">風險分級統計</span>
            </h5>

            <!-- 警示清單 -->
            <div class="alert-box mb-4 p-3 hide-on-all">
              <div class="d-flex align-items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="me-2 text-warn"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h6 class="fw-bold text-warn mb-0" data-i18n="alertList">
                  警示清單
                </h6>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <p
                    class="fw-semibold text-warn mb-1"
                    data-i18n="degenerateWarning"
                  >
                    功能衰退警示 (較前次檢測衰退超過10%)
                  </p>
                  <ul id="degenerateList" class="ms-4 text-secondary">
                    <li>
                      <span data-i18n="walkDeclineLabel">步行速度衰退：</span>
                      <span class="val">0</span>
                      <span data-i18n="unitPeople">人</span>
                    </li>
                    <li>
                      <span data-i18n="sitStandDeclineLabel"
                        >起坐速度衰退：</span
                      >
                      <span class="val">0</span>
                      <span data-i18n="unitPeople">人</span>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <p
                    class="fw-semibold text-warn mb-1"
                    data-i18n="highRiskGroup"
                  >
                    高風險族群
                  </p>
                  <ul id="levelList" class="ms-4 text-secondary">
                    <li>
                      <span data-i18n="vivifrailAFull">A級失能者：</span>
                      <span class="val">0</span>
                      <span data-i18n="unitPeople">人</span>
                    </li>
                    <li>
                      <span data-i18n="vivifrailBFull">B級衰弱者：</span>
                      <span class="val">0</span>
                      <span data-i18n="unitPeople">人</span>
                    </li>

                    <div class="d-flex justify-content-between flex-wrap">
                      <li>
                        <span data-i18n="vivifrailCFull">C級衰弱前期者：</span>
                        <span class="val">0</span>
                        <span data-i18n="unitPeople">人</span>
                      </li>

                      <div class="mt-2">
                        <button
                          id="viewDetailsBtn"
                          class="btn btn-warning btn-sm d-inline-flex align-items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="me-1"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span data-i18n="viewDetails">查看詳細名單</span>
                        </button>
                      </div>
                    </div>
                  </ul>
                </div>
              </div>
            </div>
            <!-- 詳細名單彈窗 -->
            <div
              class="modal fade"
              id="detailsModal"
              tabindex="-1"
              aria-labelledby="detailsModalLabel"
              aria-hidden="true"
            >
              <div
                class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
              >
                <div class="modal-content">
                  <div class="modal-header">
                    <h5
                      class="modal-title"
                      id="detailsModalLabel"
                      data-i18n="detailList"
                    >
                      詳細名單
                    </h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      data-i18n-aria-label="close"
                    ></button>
                  </div>

                  <div class="modal-body">
                    <div id="degenerateSection" class="mb-3">
                      <div class="row">
                        <div class="col-12 col-md-6 mb-2">
                          <div class="card">
                            <div class="card-header"></div>

                            <ul
                              class="list-group list-group-flush"
                              id="degenerateGaitSpeed"
                            ></ul>
                          </div>
                        </div>
                        <div class="col-12 col-md-6 mb-2">
                          <div class="card">
                            <div class="card-header"></div>

                            <ul
                              class="list-group list-group-flush"
                              id="degenerateChair"
                            ></ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="vivifrailSection">
                      <div class="row">
                        <div class="col-12 col-md-4 mb-2">
                          <div class="card">
                            <div class="card-header"></div>

                            <ul
                              class="list-group list-group-flush"
                              id="vivifrailA"
                            ></ul>
                          </div>
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                          <div class="card">
                            <div class="card-header"></div>

                            <ul
                              class="list-group list-group-flush"
                              id="vivifrailB"
                            ></ul>
                          </div>
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                          <div class="card">
                            <div class="card-header"></div>

                            <ul
                              class="list-group list-group-flush"
                              id="vivifrailC"
                            ></ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      data-bs-dismiss="modal"
                      data-i18n="close"
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 衰退區塊 -->
            <div class="row g-3">
              <div class="col-md-6">
                <div
                  class="risk-box p-3"
                  style="
                    border-left: 4px solid #6f42c1;
                    background-color: #f3e9fa;
                  "
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6
                        class="fw-bold mb-0 text-purple"
                        data-i18n="walkDecline"
                      >
                        步行速度衰退
                      </h6>
                    </div>
                    <div
                      class="fs-3 fw-bold text-purple"
                      id="degenerateGaitSpeedTotal"
                    >
                      0
                    </div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div
                      class="progress-bar bg-purple"
                      id="progressGaitSpeed"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div
                  class="risk-box p-3"
                  style="
                    border-left: 4px solid #0dcaf0;
                    background-color: #e8f8fc;
                  "
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6
                        class="fw-bold mb-0 text-info"
                        data-i18n="sitStandIncrease"
                      >
                        起坐秒數增加
                      </h6>
                    </div>
                    <div
                      class="fs-3 fw-bold text-info"
                      id="degenerateChairTotal"
                    >
                      0
                    </div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div class="progress-bar bg-info" id="progressChair"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 四個等級 -->
            <div class="row g-3 mt-4">
              <div class="col-md-3">
                <div class="risk-box risk-red p-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="fw-bold text-danger mb-0" data-i18n="levelA">
                        A 級
                      </h6>
                      <p class="small text-danger mb-0" data-i18n="levelADesc">
                        失能者 (SPPB=0-3分)
                      </p>
                    </div>
                    <div class="fs-3 fw-bold text-danger" id="riskA">0</div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div class="progress-bar bg-danger" id="progressA"></div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="risk-box risk-yellow p-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="fw-bold text-warn mb-0" data-i18n="levelB">
                        B 級
                      </h6>
                      <p class="small text-warn mb-0" data-i18n="levelBDesc">
                        衰弱者 (SPPB=4-6分)
                      </p>
                    </div>
                    <div class="fs-3 fw-bold text-warn" id="riskB">0</div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div class="progress-bar bg-warn" id="progressB"></div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="risk-box risk-blue p-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="fw-bold text-primary mb-0" data-i18n="levelC">
                        C 級
                      </h6>
                      <p class="small text-primary mb-0" data-i18n="levelCDesc">
                        衰弱前期者 (SPPB=7-9分)
                      </p>
                    </div>
                    <div class="fs-3 fw-bold text-primary" id="riskC">0</div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div class="progress-bar bg-primary" id="progressC"></div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="risk-box risk-green p-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="fw-bold text-success mb-0" data-i18n="levelD">
                        D 級
                      </h6>
                      <p class="small text-success mb-0" data-i18n="levelDDesc">
                        健康者 (SPPB=10-12分)
                      </p>
                    </div>
                    <div class="fs-3 fw-bold text-success" id="riskD">0</div>
                  </div>
                  <div class="mt-2 progress rounded-pill">
                    <div class="progress-bar bg-success" id="progressD"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 群體變化趨勢 -->
          <div class="mb-8 hide-on-all">
            <h5
              id="trend"
              class="fw-bold mb-3 d-flex align-items-center compare-hide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                class="me-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style="stroke: #3b82f6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span data-i18n="trend">群體變化趨勢</span>
            </h5>

            <div id="groupCompareToggle" class="my-4">
              <div class="row g-4">
                <!-- 坐站平均秒數 -->
                <div class="col-12 col-md-6">
                  <div class="card shadow-sm h-100">
                    <div class="card-body">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <h5
                          class="fw-semibold text-dark mb-0"
                          data-i18n="avgSitStandTrend"
                        >
                          平均坐站秒數趨勢
                        </h5>
                        <button
                          class="btn btn-sm btn-outline-primary download-chart"
                          data-target="sitStandChartCanvas"
                        >
                          <i class="fa fa-download me-1"></i>
                          <span data-i18n="downloadChart">下載圖檔</span>
                        </button>
                      </div>

                      <div
                        class="text-muted small mb-2"
                        data-i18n="recommendLessThan12"
                      >
                        建議小於12秒
                      </div>
                      <div
                        class="chart-container"
                        style="position: relative; height: 300px; width: 100%"
                      >
                        <canvas id="sitStandChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 平衡測驗得分 -->
                <div class="col-12 col-md-6">
                  <div class="card shadow-sm h-100">
                    <div class="card-body">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <h5
                          class="fw-semibold text-dark mb-0"
                          data-i18n="avgBalanceTrend"
                        >
                          平均平衡測驗得分
                        </h5>
                        <button
                          class="btn btn-sm btn-outline-primary download-chart"
                          data-target="balanceChartCanvas"
                        >
                          <i class="fa fa-download me-1"></i>
                          <span data-i18n="downloadChart">下載圖檔</span>
                        </button>
                      </div>

                      <div
                        class="text-muted small mb-2"
                        data-i18n="recommendGreaterThan35"
                      >
                        建議大於3.5分
                      </div>
                      <div
                        class="chart-container"
                        style="height: 300px; width: 100%"
                      >
                        <canvas id="balanceChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 步行速度趨勢 -->
                <div class="col-12 col-md-6">
                  <div class="card shadow-sm h-100">
                    <div class="card-body">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <h5
                          class="fw-semibold text-dark mb-0"
                          data-i18n="avgGaitSpeedTrend"
                        >
                          平均步行速度趨勢
                        </h5>
                        <button
                          class="btn btn-sm btn-outline-primary download-chart"
                          data-target="gaitChartCanvas"
                        >
                          <i class="fa fa-download me-1"></i>
                          <span data-i18n="downloadChart">下載圖檔</span>
                        </button>
                      </div>

                      <div
                        class="text-muted small mb-2"
                        data-i18n="recommendGte100"
                      >
                        建議大於等於100cm/s
                      </div>
                      <div
                        class="chart-container"
                        style="height: 300px; width: 100%"
                      >
                        <canvas id="gaitChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 平均AI跌倒風險機率 -->
                <div class="col-12 col-md-6">
                  <div class="card shadow-sm h-100">
                    <div class="card-body">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <h5
                          class="fw-semibold text-dark mb-0"
                          data-i18n="avgAiFallRisk"
                        >
                          平均AI跌倒風險機率
                        </h5>
                        <button
                          class="btn btn-sm btn-outline-primary download-chart"
                          data-target="riskChartCanvas"
                        >
                          <i class="fa fa-download me-1"></i>
                          <span data-i18n="downloadChart">下載圖檔</span>
                        </button>
                      </div>

                      <div class="text-muted small mb-2" style="opacity: 0">
                        15615
                      </div>
                      <div
                        class="chart-container"
                        style="height: 300px; width: 100%"
                      >
                        <canvas id="riskChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 參與者狀態 -->
          <div class="mb-4 hide-on-all compare-hide">
            <h5
              id="status"
              class="fw-bold text-dark mb-3 d-flex align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="me-2 text-primary"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span data-i18n="status">參與者狀態</span>
            </h5>
            <div class="d-flex gap-2 mb-3 sortModeSwitch">
              <button
                type="button"
                class="btn btn-outline-primary active"
                id="riskModeBtn"
                data-i18n="sortByRisk"
              >
                依AI跌倒風險等級排序
              </button>
              <button
                type="button"
                class="btn btn-outline-primary"
                id="levelModeBtn"
                data-i18n="sortByVivifrail"
              >
                依Vivifrial等級排序
              </button>
            </div>
            <div class="risk" id="riskContainer">
              <!-- 篩選按鈕 -->
              <div class="d-none d-md-flex gap-2 mb-3 filterBtnsDesktop">
                <button
                  type="button"
                  class="btn btn-secondary flex-fill active text-white"
                  data-risk="all"
                  data-i18n="all"
                >
                  全部
                </button>
                <button
                  type="button"
                  class="btn btn-danger flex-fill risk-high-danger text-white"
                  data-risk="high"
                >
                  危險
                </button>
                <button
                  type="button"
                  class="btn btn-warning flex-fill risk-high text-white"
                  data-risk="slightlyHigh"
                  data-i18n="riskHighDanger"
                >
                  高
                </button>
                <button
                  type="button"
                  class="btn btn-primary flex-fill risk-medium text-white"
                  data-risk="medium"
                  data-i18n="riskHigh"
                >
                  中
                </button>
                <button
                  type="button"
                  class="btn btn-info flex-fill risk-slightly-low text-white"
                  data-risk="slightlyLow"
                  data-i18n="riskSlightlyLow"
                >
                  稍低
                </button>
                <button
                  type="button"
                  class="btn btn-success flex-fill risk-low text-white"
                  data-risk="low"
                  data-i18n="riskLow"
                >
                  低
                </button>
              </div>

              <!-- 篩選區：手機版下拉 -->
              <div class="dropdown d-md-none mb-3 filterDropdownMobile">
                <button
                  class="btn btn-outline-secondary dropdown-toggle w-100"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-i18n="selectRisk"
                >
                  請選擇風險
                </button>
                <ul class="dropdown-menu w-100">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="all"
                      data-i18n="all"
                      >全部</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="high"
                      data-i18n="riskHighDanger"
                      >危險</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="slightlyHigh"
                      data-i18n="riskHigh"
                      >高</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="medium"
                      data-i18n="riskMedium"
                      >中</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="slightlyLow"
                      data-i18n="riskSlightlyLow"
                      >稍低</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-risk="low"
                      data-i18n="riskLow"
                      >低</a
                    >
                  </li>
                </ul>
              </div>
              <!-- 人員區塊 -->
              <div class="row g-3" id="personContainer"></div>

              <div class="mt-3 text-end">
                <button
                  id="viewAllBtn"
                  class="btn btn-primary btn-sm d-inline-flex align-items-center viewAllBtn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="me-1"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span data-i18n="viewAllParticipants">查看全部參與者</span>
                </button>
              </div>
              <!-- 查看全部彈窗 -->
              <div class="modal fade" id="participantsModal" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header flex-column">
                      <h5 class="modal-title w-100" data-i18n="allParticipants">
                        全部參與者
                      </h5>

                      <!-- 分類按鈕：桌機版 -->
                      <div
                        class="d-none d-md-flex gap-2 mt-2 w-100"
                        id="modalFilterBtnsDesktop"
                      >
                        <button
                          type="button"
                          class="btn btn-secondary flex-fill active text-white"
                          data-risk="all"
                          data-i18n="all"
                        >
                          全部
                        </button>
                        <button
                          type="button"
                          class="btn btn-danger flex-fill risk-high-danger text-white"
                          data-risk="high"
                          data-i18n="riskHighDanger"
                        >
                          危險
                        </button>
                        <button
                          type="button"
                          class="btn btn-warning flex-fill risk-high text-white"
                          data-risk="slightlyHigh"
                          data-i18n="riskHigh"
                        >
                          高
                        </button>
                        <button
                          type="button"
                          class="btn btn-primary flex-fill risk-medium text-white"
                          data-risk="medium"
                          data-118n="riskMedium"
                        >
                          中
                        </button>
                        <button
                          type="button"
                          class="btn btn-info flex-fill risk-slightly-low text-white"
                          data-risk="slightlyLow"
                          data-i18n="riskSlightlyLow"
                        >
                          稍低
                        </button>
                        <button
                          type="button"
                          class="btn btn-success flex-fill risk-low text-white"
                          data-risk="low"
                          data-i18n="riskLow"
                        >
                          低
                        </button>
                      </div>

                      <!-- 分類下拉：手機版 -->
                      <div
                        class="dropdown d-md-none mt-2 w-100"
                        id="modalFilterDropdownMobile"
                      >
                        <button
                          class="btn btn-outline-secondary dropdown-toggle w-100"
                          type="button"
                          data-bs-toggle="dropdown"
                          data-i18n="selectRisk"
                        >
                          請選擇風險
                        </button>
                        <ul class="dropdown-menu w-100">
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="all"
                              data-i18n="all"
                              >全部</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="high"
                              data-i18n="riskHighDanger"
                              >危險</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="slightlyHigh"
                              data-i18n="riskHigh"
                              >高</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="medium"
                              data-i18n="riskMedium"
                              >中</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="slightlyLow"
                              data-i18n="riskSlightlyLow"
                              >稍低</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-risk="low"
                              data-i18n="riskLow"
                              >低</a
                            >
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        class="btn-close mt-2"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        data-i18n-aria-label="close"
                      ></button>
                    </div>

                    <div class="modal-body">
                      <div class="row g-3" id="modalPersonContainer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="level" id="levelContainer">
              <!-- 篩選按鈕：桌機版 -->
              <div class="d-none d-md-flex gap-2 mb-3 levelFilterBtnsDesktop">
                <button
                  type="button"
                  class="btn btn-secondary flex-fill active text-white"
                  data-filter="all"
                  data-i18n="all"
                  data-i18n="all"
                >
                  全部
                </button>
                <button
                  type="button"
                  class="btn btn-danger flex-fill text-white"
                  data-filter="A"
                  data-i18n="levelAFull"
                >
                  A級失能者
                </button>
                <button
                  type="button"
                  class="btn btn-warning flex-fill text-white"
                  data-filter="B"
                  data-i18n="levelBFull"
                >
                  B級衰弱者
                </button>
                <button
                  type="button"
                  class="btn btn-primary flex-fill text-white"
                  data-filter="C"
                  data-i18n="levelCFull"
                >
                  C級衰弱前期者
                </button>
                <button
                  type="button"
                  class="btn btn-success flex-fill text-white"
                  data-filter="D"
                  data-i18n="levelDFull"
                >
                  D級健康者
                </button>
              </div>

              <!-- 篩選區：手機版下拉 -->
              <div class="dropdown d-md-none mb-3 levelFilterDropdownMobile">
                <button
                  class="btn btn-outline-secondary dropdown-toggle w-100"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-i18n="selectLevel"
                >
                  請選擇等級
                </button>
                <ul class="dropdown-menu w-100">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-filter="all"
                      data-i18n="all"
                      >全部</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-filter="A"
                      data-i18n="levelAFull"
                      >A級失能者</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-filter="B"
                      data-i18n="levelBFull"
                      >B級衰弱者</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-filter="C"
                      data-i18n="levelCFull"
                      >C級衰弱前期者</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      data-filter="D"
                      data-i18n="levelDFull"
                      >D級健康者</a
                    >
                  </li>
                </ul>
              </div>

              <!-- 人員區塊 -->
              <div class="row g-3" id="levelPersonContainer"></div>

              <!-- 查看全部參與者按鈕 -->
              <div class="mt-3 text-end">
                <button
                  id="viewAllLevelBtn"
                  class="btn btn-primary btn-sm d-inline-flex align-items-center viewAllBtn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="me-1"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span data-i18n="viewAllParticipants">查看全部參與者</span>
                </button>
              </div>

              <!-- 查看全部彈窗 -->
              <div class="modal fade" id="participantsLevelModal" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header flex-column">
                      <h5 class="modal-title w-100" data-i18n="allParticipants">
                        全部參與者
                      </h5>

                      <!-- 桌機版篩選按鈕 -->
                      <div
                        class="d-none d-md-flex gap-2 mt-2 w-100"
                        id="modalLevelFilterBtnsDesktop"
                      >
                        <button
                          type="button"
                          class="btn btn-secondary flex-fill active text-white"
                          data-filter="all"
                          data-i18n="all"
                        >
                          全部
                        </button>
                        <button
                          type="button"
                          class="btn btn-danger flex-fill text-white"
                          data-filter="A"
                          data-i18n="levelAFull"
                        >
                          A級失能者
                        </button>
                        <button
                          type="button"
                          class="btn btn-warning flex-fill text-white"
                          data-filter="B"
                          data-i18n="levelBFull"
                        >
                          B級衰弱者
                        </button>
                        <button
                          type="button"
                          class="btn btn-primary flex-fill text-white"
                          data-filter="C"
                          data-i18n="levelCFull"
                        >
                          C級衰弱前期者
                        </button>
                        <button
                          type="button"
                          class="btn btn-success flex-fill text-white"
                          data-i18n="levelDFull"
                          data-filter="D"
                        >
                          D級健康者
                        </button>
                      </div>

                      <!-- 手機版篩選下拉 -->
                      <div
                        class="dropdown d-md-none mt-2 w-100"
                        id="modalLevelFilterDropdownMobile"
                      >
                        <button
                          class="btn btn-outline-secondary dropdown-toggle w-100"
                          type="button"
                          data-bs-toggle="dropdown"
                          data-i18n="selectLevel"
                        >
                          請選擇等級
                        </button>
                        <ul class="dropdown-menu w-100">
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-filter="all"
                              data-i18n="all"
                              >全部</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-filter="A"
                              data-i18n="levelAFull"
                              >A級失能者</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-filter="B"
                              data-i18n="levelBFull"
                              >B級衰弱者</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-filter="C"
                              data-i18n="levelCFull"
                              >C級衰弱前期者</a
                            >
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              data-filter="D"
                              data-i18n="levelDFull"
                              >D級健康者</a
                            >
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        class="btn-close mt-2"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        data-i18n-aria-label="close"
                      ></button>
                    </div>

                    <div class="modal-body">
                      <div class="row g-3" id="modalLevelPersonContainer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 地圖區塊 -->
          <div class="mb-4 compare-hide">
            <h5
              id="location"
              class="fw-bold text-dark mb-3 d-flex align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="me-2 text-primary"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span data-i18n="locationDistribution">檢測據點分布</span>
            </h5>

            <!-- 地圖 -->
            <div id="map"></div>
          </div>
  `;
}
function initCompareView() {
  // 重置資料
  dashboardState.selectedSites = [];

  // 渲染 UI（現在 DOM 已經存在了）
  renderSelectedSites();
  renderSiteSelector();

  // 初始化圖表
  initEmptyCharts();
  drawNoDataChart();
}
function initDefaultView() {
  initLogoutButton();
  initLocationPage();
  initTable();
  initSidebarToggle();
  initDownloadPdf();
  initDateFilter();
  initGroupCompare();
  initPersonCardRisk();
  initPersonCardLevel();
  initRiskModeUI();
  initDownloadChart();
  initDetailModal();
  initViewAllModal();
  initSortModeSwitch();
}
document.addEventListener("DOMContentLoaded", async () => {
  // initLogoutButton();
  // initLocationPage();
  // initTable();
  // initSidebarToggle();
  // initDownloadPdf();
  // initDateFilter();
  // initGroupCompare();
  // initPersonCardRisk();
  // initPersonCardLevel();
  // initRiskModeUI();
  // initDownloadChart();
  // initDetailModal();
  // initViewAllModal();
  // initSortModeSwitch();
  renderView();
});
