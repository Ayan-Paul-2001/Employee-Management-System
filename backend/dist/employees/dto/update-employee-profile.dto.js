"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_employee_profile_dto_1 = require("./create-employee-profile.dto");
class UpdateEmployeeProfileDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_employee_profile_dto_1.CreateEmployeeProfileDto, ['userId'])) {
}
exports.UpdateEmployeeProfileDto = UpdateEmployeeProfileDto;
//# sourceMappingURL=update-employee-profile.dto.js.map