package com.project.ims.model.dto;

import com.project.ims.model.entity.Partner;
import lombok.Data;

@Data
public class PartnerDTOForShow {
    private int partnerID;
    private String name;
    private String address;
    private String contactNumber;

    public static PartnerDTOForShow fromEntity(Partner partner) {
        PartnerDTOForShow dto = new PartnerDTOForShow();
        dto.setPartnerID(partner.getPartnerID());
        dto.setName(partner.getName());
        dto.setAddress(partner.getAddress());
        dto.setContactNumber(partner.getContactNumber());
        return dto;
    }
}
